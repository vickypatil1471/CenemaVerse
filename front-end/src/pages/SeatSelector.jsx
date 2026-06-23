import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { ChevronLeft, Sofa, RockingChair, Tag } from "lucide-react";
import { seatSelectorStyles } from "../assets/dummyStyles";
import axios from "axios";

import { QRCodeSVG } from "qrcode.react";

import MOVIES_MAIN from "../assets/dummymdata";
import MOVIES_FEATURED from "../assets/dummymoviedata";



const MOVIES_FEATURED_NORMALISED = MOVIES_FEATURED.map((m) => ({
  ...m,
  image: m.img,
}));

const ALL_MOVIES = [
  ...MOVIES_FEATURED_NORMALISED,
  ...MOVIES_MAIN,
];

const ROWS = [
  { id: "A", type: "standard", count: 8 },
  { id: "B", type: "standard", count: 8 },
  { id: "C", type: "standard", count: 8 },
  { id: "D", type: "recliner", count: 8 },
  { id: "E", type: "recliner", count: 8 },
];

const seatId = (r, n) => `${r}${n}`;

export default function SeatSelector() {
  const { id, slot } = useParams();

  const movieId = id;

  const slotKey = slot
    ? decodeURIComponent(slot)
    : "";

  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);

useEffect(() => {
  const fetchMovie = async () => {
    try {
      // FIRST TRY DATABASE MOVIE
      const { data } = await axios.get(
        `http://localhost:5000/api/movies/${movieId}`
      );

      if (data) {
        setMovie(data);
        return;
      }
    } catch (error) {
      console.log(
        "Backend movie not found. Trying dummy movie..."
      );
    }

    // FALLBACK TO DUMMY MOVIES
    const dummyMovie = ALL_MOVIES.find(
      (m) =>
        String(m.id) === String(movieId) ||
        String(m._id) === String(movieId)
    );

    setMovie(dummyMovie || null);
  };

  fetchMovie();
}, [movieId]);

  const storageKey = `bookings_${movieId}_${slotKey}`;

  const [booked, setBooked] = useState(
    new Set()
  );

  const [selected, setSelected] =
    useState(new Set());

const [showPaymentOptions, setShowPaymentOptions] =
  useState(false);

const [paid, setPaid] =
  useState(false);

const [showUpiQR, setShowUpiQR] =
  useState(false);

const [showNetBanking, setShowNetBanking] =
  useState(false);
    
  const showTimePassed =
  slotKey &&
  new Date(slotKey).getTime() <
    new Date().getTime();
  
useEffect(() => {
  const showDate = new Date(slotKey);

  if (
    !slotKey ||
    isNaN(showDate.getTime())
  ) {
    toast.error("Invalid showtime");

    navigate("/movies");

    return;
  }

  if (showDate < new Date()) {
    toast.error(
      "This show has already ended."
    );

    navigate("/movies");

    return;
  }
}, [slotKey, navigate]);

    

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(storageKey);

      if (raw) {
        const arr = JSON.parse(raw);

        setBooked(new Set(arr));
      } else {
        setBooked(new Set());
      }
    } catch {
      setBooked(new Set());
    }

    setSelected(new Set());
  }, [storageKey]);

  // changes made
 const audiForSlot = useMemo(() => {
  if (!movie) return "Audi 1";

  return movie.auditorium || "Audi 1";
}, [movie]);

  const toggleSeat = (id) => {
    if (booked.has(id)) return;

    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const basePrice =
  Number(movie?.seatPrices?.standard) || 250;

  const total = [...selected].reduce(
    (sum, seat) => {
      const rowLetter = seat[0];

      const row = ROWS.find(
        (r) => r.id === rowLetter
      );

      const multiplier =
        row?.type === "recliner"
          ? 1.5
          : 1;

      return (
        sum +
        basePrice * multiplier
      );
    },
    0
  );

  const upiLink =
  `upi://pay?pa=7972204257@ybl&pn=CineVerse&am=${Math.round(total)}&cu=INR`;

  const selectedCount = selected.size;


  const confirmBooking = async () => {

if (showTimePassed) {
  toast.error(
    "This show has already ended."
  );
  return;
}

    if (selected.size === 0) {
      toast.error("Select at least one seat.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

const token = localStorage.getItem("cine_token");

console.log("TOKEN:", token);

if (
  !token ||
  token === "null" ||
  token === "undefined" ||
  token.trim() === ""
) {
  toast.error(
    "Please login to continue booking."
  );

  localStorage.removeItem("cine_token");

  navigate("/login");

  return;
}

if (!movie) {
  toast.error("Movie not found.");
  return;
}
try {
  const { data } = await axios.post(
    "http://localhost:5000/api/bookings",
    {
      movieId: movie._id || movie.id,
      movieTitle: movie.title,
      moviePoster:
        movie.image ||
        movie.img ||
        movie.posterUrl,
      basePrice: Number(basePrice),
      seats: [...selected],
      showtimeDate: new Date(slotKey),
      showtimeTime: new Date(
        slotKey
      ).toLocaleTimeString("en-IN"),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

      console.log(
        "ORDER RESPONSE:",
        data
      );

      const options = {
        key: data.keyId,

        amount: data.amount,

        currency:
          data.currency || "INR",

        name: "CineVerse",

        description: `Booking for ${movie.title}`,

        order_id: data.orderId,

        handler: async function (
          response
        ) {
          try {
            const verifyRes =
              await axios.post(
                "http://localhost:5000/api/bookings/verify",
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

            console.log(
              "VERIFY RESPONSE:",
              verifyRes.data
            );

            const updated =
              new Set([
                ...booked,
                ...selected,
              ]);

            localStorage.setItem(
              storageKey,
              JSON.stringify([
                ...updated,
              ])
            );

            setBooked(updated);

            setSelected(new Set());

            toast.success(
              "Payment Successful 🎉"
            );

            setTimeout(() => {
              navigate("/bookings");
            }, 1500);
          } catch (err) {
            console.log(
              "VERIFY ERROR:",
              err.response?.data || err
            );

            toast.error(
              err.response?.data
                ?.message ||
                "Payment verification failed"
            );
          }
        },

        prefill: {
          email:
            localStorage.getItem(
              "cine_user_email"
            ) || "",
        },

        theme: {
          color: "#dc2626",
        },

modal: {
  ondismiss: async function () {

    toast.error(
      "Payment cancelled."
    );

    try {
      await axios.delete(
        `http://localhost:5000/api/bookings/cancel/${data.booking._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
},
      };

      const rzp =
        new window.Razorpay(options);

      rzp.on(
        "payment.failed",
        function (response) {
          console.log(
            "PAYMENT FAILED:",
            response.error
          );

          toast.error(
            response.error
              ?.description ||
              "Payment failed."
          );
        }
      );

      rzp.open();
    } catch (err) {
      console.log(
        "BOOKING ERROR:",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
          "Booking failed."
      );
    }
  };

const confirmNetBankingBooking =
  async () => {
    try {
      const token =
        localStorage.getItem(
          "cine_token"
        );

      await axios.post(
        "http://localhost:5000/api/bookings/netbanking",
        {
          movieId:
            movie._id || movie.id,

          movieTitle:
            movie.title,

          moviePoster:
            movie.image ||
            movie.img ||
            movie.posterUrl,

          seats: [...selected],

          amountPaid: total,

          showtimeDate:
            new Date(slotKey),

          showtimeTime:
            new Date(
              slotKey
            ).toLocaleTimeString(
              "en-IN"
            ),
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Ticket Booked Successfully"
      );

      navigate("/bookings");
    } catch (err) {
      console.log(err);

      toast.error(
        "Booking Failed"
      );
    }
  };

  return (
    <div className={seatSelectorStyles.pageContainer}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />

      <style>
        {seatSelectorStyles.customCSS}
      </style>

      <div
        className={
          seatSelectorStyles.mainContainer
        }
      >
        <div
          className={
            seatSelectorStyles.headerContainer
          }
        >
          <Link
            to={`/movie/${movieId}`}
            className={
              seatSelectorStyles.backButton
            }
          >
            <ChevronLeft
              className={
                seatSelectorStyles.backButtonIcon
              }
              size={24}
            />
            Back
          </Link>

          <div
            className={
              seatSelectorStyles.titleContainer
            }
          >
            <h1
              className={
                seatSelectorStyles.movieTitle
              }
            >
              {movie?.title ||
                "Select Seats"}
            </h1>

            <div
              className={
                seatSelectorStyles.showtimeText
              }
            >
              {slotKey
                ? new Date(
                    slotKey
                  ).toLocaleString(
                    "en-IN",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "Showtime unavailable"}
            </div>
          </div>

          <div
            style={{
              background:
                "linear-gradient(90deg,#ef4444,#dc2626)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {audiForSlot}
          </div>
        </div>

        <div
          className={
            seatSelectorStyles.screenContainer
          }
        >
          <div
            className={
              seatSelectorStyles.screen
            }
          >
            <div
              className={
                seatSelectorStyles.screenText
              }
            >
              SCREEN
            </div>

            <div
              className={
                seatSelectorStyles.screenSubtext
              }
            >
              All eyes this way
            </div>
          </div>
        </div>

        <div
          className={
            seatSelectorStyles.mainContent
          }
        >
          <div
            className={
              seatSelectorStyles.sectionHeader
            }
          >
            <div
              className={
                seatSelectorStyles.sectionTitleContainer
              }
            >
              <h2
                className={
                  seatSelectorStyles.sectionTitle
                }
              >
                Choose Your Seats
              </h2>

              <div
                className={
                  seatSelectorStyles.titleDivider
                }
              ></div>
            </div>
          </div>

          <div
            className={
              seatSelectorStyles.seatGridContainer
            }
          >
            {ROWS.map((row) => (
              <div
                key={row.id}
                className={
                  seatSelectorStyles.rowContainer
                }
              >
                <div
                  className={
                    seatSelectorStyles.rowHeader
                  }
                >
                  <span
                    className={
                      seatSelectorStyles.rowLabel
                    }
                  >
                    {row.id}
                  </span>

                  <div
                    className={
                      seatSelectorStyles.seatGrid
                    }
                  >
                    {Array.from({
                      length: row.count,
                    }).map((_, i) => {
                      const num = i + 1;

                      const sid = seatId(
                        row.id,
                        num
                      );

                      const isBooked =
                        booked.has(sid);

                      const isSelected =
                        selected.has(sid);

                      let cls =
                        seatSelectorStyles.seatButton;

                      if (isBooked) {
                        cls += ` ${seatSelectorStyles.seatButtonBooked}`;
                      } else if (
                        isSelected
                      ) {
                        cls +=
                          row.type ===
                          "recliner"
                            ? ` ${seatSelectorStyles.seatButtonSelectedRecliner}`
                            : ` ${seatSelectorStyles.seatButtonSelectedStandard}`;
                      } else {
                        cls +=
                          row.type ===
                          "recliner"
                            ? ` ${seatSelectorStyles.seatButtonAvailableRecliner}`
                            : ` ${seatSelectorStyles.seatButtonAvailableStandard}`;
                      }

                      return (
                        <button
                          key={sid}
                          onClick={() =>
                            toggleSeat(sid)
                          }
                          disabled={isBooked}
                          className={cls}
                        >
                          <div
                            className={
                              seatSelectorStyles.seatContent
                            }
                          >
                            {row.type ===
                            "recliner" ? (
                              <Sofa
                                size={16}
                              />
                            ) : (
                              <RockingChair
                                size={12}
                              />
                            )}

                            <div
                              className={
                                seatSelectorStyles.seatNumber
                              }
                            >
                              {num}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <span
                    className={
                      seatSelectorStyles.rowType
                    }
                  >
                    {row.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className={
              seatSelectorStyles.summaryGrid
            }
          >
            <div
              className={
                seatSelectorStyles.summaryContainer
              }
            >
              <h3
                className={
                  seatSelectorStyles.summaryTitle
                }
              >
                <Tag size={18} />
                Booking Summary
              </h3>

              {selectedCount > 0 ? (
                <>
                  <div
                    className={
                      seatSelectorStyles.selectedSeatsContainer
                    }
                  >
                    <div
                      className={
                        seatSelectorStyles.selectedSeatsLabel
                      }
                    >
                      Selected Seats:
                    </div>

                    <div
                      className={
                        seatSelectorStyles.selectedSeatsList
                      }
                    >
                      {[...selected]
                        .sort()
                        .map((seat) => (
                          <span
                            key={seat}
                            className={
                              seatSelectorStyles.selectedSeatBadge
                            }
                          >
                            {seat}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div
                    className={
                      seatSelectorStyles.totalContainer
                    }
                  >
                    <div
                      className={
                        seatSelectorStyles.pricingRow
                      }
                    >
                      <span
                        className={
                          seatSelectorStyles.totalLabel
                        }
                      >
                        Total Amount:
                      </span>

                      <span
                        className={
                          seatSelectorStyles.totalValue
                        }
                      >
                        ₹{Math.round(total)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      seatSelectorStyles.actionButtons
                    }
                  >
                    <button
                      onClick={() =>
                        setSelected(
                          new Set()
                        )
                      }
                      className={
                        seatSelectorStyles.clearButton
                      }
                    >
                      Clear Selection
                    </button>

<button
  onClick={() =>
    setShowPaymentOptions(true)
  }
  className={
    seatSelectorStyles.confirmButton
  }
>
  Pay ₹{Math.round(total)}
</button>
{showPaymentOptions && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.8)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        background: "#111",
        padding: "30px",
        borderRadius: "15px",
        width: "420px",
        color: "white",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          marginBottom: "20px",
        }}
      >
        Select Payment Method
      </h2>



      <button
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "10px",
          background: "#dc2626",
          color: "white",
          borderRadius: "10px",
        }}
        onClick={() => {
          setShowPaymentOptions(false);
          confirmBooking();
        }}
      >
        Continue With Razorpay
      </button>

      <button
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "10px",
          background: "#2563eb",
          color: "white",
          borderRadius: "10px",
        }}

onClick={() =>
  navigate(
    `/netbanking/${movieId}/${encodeURIComponent(slotKey)}`,
    {
      state: {
        movie,
        seats: [...selected],
        amount: total,
        auditorium: audiForSlot,
        slotKey,
      },
    }
  )
}
      >
        Net Banking
      </button>

      <button
        style={{
          width: "100%",
          padding: "14px",
          background: "#16a34a",
          color: "white",
          borderRadius: "10px",
        }}
        onClick={() => {
          setShowUpiQR(true);
          setShowNetBanking(false);
        }}
      >
        UPI QR Scanner
      </button>

      <button
        style={{
          width: "100%",
          marginTop: "15px",
          padding: "12px",
          background: "#333",
          color: "white",
          borderRadius: "10px",
        }}
        onClick={() =>
          setShowPaymentOptions(false)
        }
      >
        Close
      </button>

      {showNetBanking && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h3>
            Net Banking
          </h3>

          <input
            placeholder="Customer ID"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
            }}
          />

          <input
            placeholder="Password"
            type="password"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
            }}
          />

          <button
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              background: "#2563eb",
              color: "white",
            }}
            onClick={() => {
              setShowPaymentOptions(false);
              confirmBooking();
            }}
          >
            Continue
          </button>
        </div>
      )}

{showUpiQR && (
  <div className="text-center mt-6">
    <h3 className="text-xl font-bold mb-4">
      Scan QR To Pay
    </h3>

    <div className="bg-white p-4 rounded-xl inline-block">
      <QRCodeSVG
        value={upiLink}
        size={250}
      />
    </div>

    <p className="mt-4 text-lg font-bold">
      Amount ₹{Math.round(total)}
    </p>

    <div className="mt-4 flex justify-center items-center gap-2">
      <input
        type="checkbox"
        checked={paid}
        onChange={(e) =>
          setPaid(e.target.checked)
        }
      />

      <label>
        I confirm payment is completed
      </label>
    </div>

    <button
      className="bg-green-600 px-6 py-3 rounded-lg mt-4"
      onClick={async () => {
        if (!paid) {
          alert(
            "Please confirm payment first"
          );
          return;
        }

        await confirmNetBankingBooking();
      }}
    >
      I Have Paid
    </button>
  </div>
)}

    </div>
  </div>
)}
                  </div>
                </>
              ) : (
                <div
                  className={
                    seatSelectorStyles.emptyState
                  }
                >
                  <div
                    className={
                      seatSelectorStyles.emptyStateTitle
                    }
                  >
                    No seats selected
                  </div>

                  <div
                    className={
                      seatSelectorStyles.emptyStateSubtitle
                    }
                  >
                    Click on a seat above
                    to select it
                  </div>
                </div>
              )}
            </div>

            <div
              className={
                seatSelectorStyles.pricingContainer
              }
            >
              <h3
                className={
                  seatSelectorStyles.pricingTitle
                }
              >
                <Tag size={18} />
                Pricing
              </h3>

              <div
                className={
                  seatSelectorStyles.pricingItem
                }
              >
                <div
                  className={
                    seatSelectorStyles.pricingRow
                  }
                >
                  <span
                    className={
                      seatSelectorStyles.pricingLabel
                    }
                  >
                    Standard
                  </span>

                  <span
                    className={
                      seatSelectorStyles.pricingValueStandard
                    }
                  >
                    ₹{basePrice}
                  </span>
                </div>
              </div>

              <div
                className={
                  seatSelectorStyles.pricingItem
                }
                style={{
                  marginTop: "0.75rem",
                }}
              >
                <div
                  className={
                    seatSelectorStyles.pricingRow
                  }
                >
                  <span
                    className={
                      seatSelectorStyles.pricingLabel
                    }
                  >
                    Recliner
                  </span>

                  <span
                    className={
                      seatSelectorStyles.pricingValueRecliner
                    }
                  >
                    ₹
                    {Math.round(
                      basePrice * 1.5
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
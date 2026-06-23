import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function AddTheaterPage() {
  const [theaterName, setTheaterName] = useState("");
  const [location, setLocation] = useState("");

  const [screens, setScreens] = useState([
    {
      screenName: "Audi 1",
      totalSeats: 40,
    },
    {
      screenName: "Audi 2",
      totalSeats: 40,
    },
    {
      screenName: "Audi 3",
      totalSeats: 40,
    },
  ]);

  const handleScreenChange = (index, field, value) => {
    const updated = [...screens];

    updated[index][field] =
      field === "totalSeats" ? Number(value) : value;

    setScreens(updated);
  };

  const addScreen = () => {
    setScreens([
      ...screens,
      {
        screenName: "",
        totalSeats: 40,
      },
    ]);
  };

  const removeScreen = (index) => {
    const updated = screens.filter((_, i) => i !== index);

    setScreens(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!theaterName.trim()) {
      return toast.error("Enter theater name");
    }

    if (!location.trim()) {
      return toast.error("Enter theater location");
    }

    try {
      const token = localStorage.getItem("cine_token");

      await axios.post(
        "http://localhost:5000/api/theaters",
        {
          name: theaterName,
          location,
          screens,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Theater Added Successfully");

      setTheaterName("");
      setLocation("");

      setScreens([
        {
          screenName: "Audi 1",
          totalSeats: 40,
        },
        {
          screenName: "Audi 2",
          totalSeats: 40,
        },
        {
          screenName: "Audi 3",
          totalSeats: 40,
        },
      ]);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add theater"
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        color: "white",
      }}
    >
      <ToastContainer />

      <h1
        style={{
          fontSize: "32px",
          marginBottom: "30px",
          fontWeight: "bold",
        }}
      >
        Add Theater
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label>Theater Name</label>

          <input
            type="text"
            value={theaterName}
            onChange={(e) =>
              setTheaterName(e.target.value)
            }
            placeholder="PVR Ratnagiri"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Location</label>

          <input
            type="text"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            placeholder="Ratnagiri"
            style={inputStyle}
          />
        </div>

        <h2 style={{ marginBottom: "20px" }}>
          Screens
        </h2>

        {screens.map((screen, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #333",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
            }}
          >
            <input
              type="text"
              value={screen.screenName}
              onChange={(e) =>
                handleScreenChange(
                  index,
                  "screenName",
                  e.target.value
                )
              }
              placeholder="Audi Name"
              style={inputStyle}
            />

            <input
              type="number"
              value={screen.totalSeats}
              onChange={(e) =>
                handleScreenChange(
                  index,
                  "totalSeats",
                  e.target.value
                )
              }
              placeholder="Total Seats"
              style={inputStyle}
            />

            <button
              type="button"
              onClick={() =>
                removeScreen(index)
              }
              style={removeBtn}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addScreen}
          style={addBtn}
        >
          Add Screen
        </button>

        <br />
        <br />

        <button
          type="submit"
          style={submitBtn}
        >
          Save Theater
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "12px",
  background: "#111",
  border: "1px solid #444",
  borderRadius: "8px",
  color: "white",
};

const addBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
};

const removeBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
};

const submitBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "14px 25px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};
import React, { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import StarIcon from "@mui/icons-material/Star";
import RoomIcon from "@mui/icons-material/Room";
import "mapbox-gl/dist/mapbox-gl.css";
import "./app.css";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: 31.6,
    longitude: 35,
    zoom: 6.5,
  });

  useEffect(() => {
    async function getPins() {
      try {
        const response = await axios.get("http://localhost:8080/api/pins");
        setPins(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    getPins();
  }, []);

  function handleMarkerClick(id, lat, long) {
    setCurrentPlaceId(id);
    setViewState({ ...viewState, latitude: lat, longitude: long });
  }

  const handleAddClick = (e) => {
    const { lat, lng } = e.lngLat;

    setNewPlace({
      lat: lat,
      long: lng,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.long,
    };
    try {
      const res = await axios.post("http://localhost:8080/api/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    myStorage.removeItem("user");
  };

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100vw", height: "100vh" }}
      //  mapStyle="mapbox://styles/mapbox/streets-v9"
      mapStyle="mapbox://styles/safak/cknndpyfq268f17p53nmpwira"
      mapboxAccessToken={process.env.REACT_APP_MAPBOX}
      onDblClick={handleAddClick}
      transitionDuration="200"
    >
      {pins.length > 0 &&
        pins.map((p) => (
          <div key={p._id}>
            <Marker
              longitude={p.long}
              latitude={p.lat}
              offsetLeft={-viewState.zoom * 3.5}
              offsetTop={-viewState.zoom * 7}
            >
              <RoomIcon
                style={{
                  fontSize: viewState.zoom * 7,
                  color: p.username === currentUser ? "tomato" : "slateblue",
                  cursor: "pointer",
                }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                longitude={p.long}
                latitude={p.lat}
                anchor="right"
                closeButton={true}
                closeOnClick={false}
                onClose={() => {
                  setCurrentPlaceId(null);
                }}
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<StarIcon className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    created By <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                </div>
              </Popup>
            )}
          </div>
        ))}
      {newPlace && (
        <Popup
          longitude={newPlace.lat}
          latitude={newPlace.long}
          anchor="right"
          closeButton={true}
          closeOnClick={false}
          onClose={() => {
            setNewPlace(null);
          }}
        >
          <div>
            <form onSubmit={handleSubmit}>
              <label>Title</label>
              <input
                placeholder="Enter a title"
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Review</label>
              <textarea
                placeholder="Say us something about this place"
                onChange={(e) => setDesc(e.target.value)}
              />
              <label>Rating</label>
              <select onChange={(e) => setRating(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <button className="submitButton" type="submit">
                Add Pin
              </button>
            </form>
          </div>
        </Popup>
      )}
      {currentUser ? (
        <button className="button logout" onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <div className="buttons">
          <button className="button login" onClick={() => setShowLogin(true)}>
            Login
          </button>
          <button
            className="button register"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      )}
      {showRegister && <Register setShowRegister={setShowRegister} />}
      {showLogin && (
        <Login
          setShowLogin={setShowLogin}
          setCurrentUsername={setCurrentUser}
          myStorage={myStorage}
        />
      )}
    </Map>
  );
}

export default App;

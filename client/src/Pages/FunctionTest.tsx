import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tour, Favorite } from '../types/allTypes';

function FunctionTest(): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [favoriteData, setFavoriteData] = useState({
    name: 'Eiffel Tower',
    latitude: '48.8584',
    longitude: '2.2945',
    googlePOIId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ'
  });
  const [favoritesList, setFavoritesList] = useState<Favorite[]>([]);
  const [tourData, setTourData] = useState({
    title: 'Test Tour',
    destination: 'Paris, France',
    startDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });
  const [toursList, setToursList] = useState<Tour[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [favoriteTourMapping, setFavoriteTourMapping] = useState<{ [favoriteId: string]: string }>({});

  // Auth & Profile
  const handleCheckAuth = async (): Promise<void> => {
    try {
      const res = await fetch('/api/check-auth', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseMessage('Error checking auth: ' + error);
    }
  };

  const handleGetProfile = async (): Promise<void> => {
    try {
      const res = await fetch('/user', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseMessage('Error getting profile: ' + error);
    }
  };

  // Favorites
  const handleFavoriteInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFavoriteData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFavorite = async (): Promise<void> => {
    const latitude = parseFloat(favoriteData.latitude);
    const longitude = parseFloat(favoriteData.longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      setResponseMessage("Invalid latitude or longitude");
      return;
    }
    try {
      const payload = { name: favoriteData.name, latitude, longitude, googlePOIId: favoriteData.googlePOIId, };
      const res = await fetch('/user/favorite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchFavorites();
    } catch (error) {
      setResponseMessage('Error adding favorite: ' + error);
    }
  };

  const fetchFavorites = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/user/favorite', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setFavoritesList(data.favorites || data);
    } catch (error) {
      setResponseMessage('Error fetching favorites: ' + error);
    }
  }, []);

  const handleDeleteFavorite = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/user/favorite/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchFavorites();
    } catch (error) {
      setResponseMessage('Error deleting favorite: ' + error);
    }
  };

  // Tours
  const handleTourInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTourData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTour = async (): Promise<void> => {
    if (!user) {
      setResponseMessage('User not available');
      return;
    }
    if (!tourData.title || !tourData.destination || !tourData.startDate || !tourData.endDate) {
      setResponseMessage("Please fill in all tour fields");
      return;
    }
    try {
      const payload = { ...tourData, days: [] };
      const res = await fetch(`/tour/${user._id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchTours();
    } catch (error) {
      setResponseMessage('Error creating tour: ' + error);
    }
  };

  const fetchTours = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const res = await fetch(`/tour/${user._id}`, { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setToursList(data);
    } catch (error) {
      setResponseMessage('Error fetching tours: ' + error);
    }
  }, [user]);

  const handleGetTourById = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/tour/one/${id}`, { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseMessage('Error getting tour by ID: ' + error);
    }
  };

  const handleUpdateTour = async (id: string): Promise<void> => {
    try {
      const payload = { title: 'Updated Tour Title' };
      const res = await fetch(`/tour/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchTours();
    } catch (error) {
      setResponseMessage('Error updating tour: ' + error);
    }
  };

  const handleDeleteTour = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/tour/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchTours();
    } catch (error) {
      setResponseMessage('Error deleting tour: ' + error);
    }
  };

  // Add a favorite or place to a Tour
  const handleAddLocationToTour = async (): Promise<void> => {
    if (!selectedTourId) {
      setResponseMessage("No tour selected");
      return;
    }
    const tour = toursList.find(t => t._id === selectedTourId);
    if (!tour) {
      setResponseMessage("Selected tour not found");
      return;
    }
    const latitude = parseFloat(favoriteData.latitude);
    const longitude = parseFloat(favoriteData.longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      setResponseMessage("Invalid latitude or longitude");
      return;
    }
    const newLocation = {
      name: favoriteData.name,
      latitude,
      longitude,
      googlePOIId: favoriteData.googlePOIId
    };

    let updatedDays;
    // If no day is in tour, create a new day and put into fist day
    if (!tour.days || tour.days.length === 0) {
      updatedDays = [{
        date: tour.startDate,
        locations: [newLocation],
      }];
    } else {
      // Else add to first day
      updatedDays = [...tour.days];
      updatedDays[0].locations = [...updatedDays[0].locations, newLocation];
    }

    try {
      const payload = { days: updatedDays };
      const res = await fetch(`/tour/${selectedTourId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchTours();
    } catch (error) {
      setResponseMessage("Error adding location to tour: " + error);
    }
  };

  const handleRemoveLocationFromTour = async (tourId: string, dayId: string, locationId: string): Promise<void> => {
    const tour = toursList.find(t => t._id === tourId);
    if (!tour) {
      setResponseMessage("Tour not found");
      return;
    }
    const updatedDays = tour.days.map(day => {
      if (day._id === dayId) {
        return { ...day, locations: day.locations.filter(loc => loc._id !== locationId) };
      }
      return day;
    });
    try {
      const payload = { days: updatedDays };
      const res = await fetch(`/tour/${tourId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchTours();
    } catch (error) {
      setResponseMessage("Error removing location from tour: " + error);
    }
  };

  // Add a favorite to a tour
  const handleFavoriteTourChange = (favoriteId: string, tourId: string) => {
    setFavoriteTourMapping(prev => ({ ...prev, [favoriteId]: tourId }));
  };

  const handleAddFavoriteToTour = async (favorite: Favorite): Promise<void> => {
    const tourId = favoriteTourMapping[favorite._id];
    if (!tourId) {
      setResponseMessage("Please select a tour for this favorite");
      return;
    }
    const tour = toursList.find(t => t._id === tourId);
    if (!tour) {
      setResponseMessage("Selected tour not found");
      return;
    }
    const newLocation = {
      name: favorite.name,
      latitude: favorite.latitude,
      longitude: favorite.longitude,
      googlePOIId: favorite.googlePOIId
    };

    let updatedDays;
    if (!tour.days || tour.days.length === 0) {
      updatedDays = [{
        date: tour.startDate,
        locations: [newLocation],
      }];
    } else {
      updatedDays = [...tour.days];
      updatedDays[0].locations = [...updatedDays[0].locations, newLocation];
    }

    try {
      const payload = { days: updatedDays };
      const res = await fetch(`/tour/${tourId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
      await fetchTours();
    } catch (error) {
      setResponseMessage("Error adding favorite to tour: " + error);
    }
  };

  // Upload Profile Picture
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadProfileImage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedFile) {
      setResponseMessage("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("profileImage", selectedFile);
    try {
      const res = await fetch("/user/profileimage", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      setResponseMessage(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponseMessage("Error uploading profile image: " + error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
      fetchTours();
    }
  }, [isAuthenticated, user, fetchTours, fetchFavorites]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Function Test Page</h1>
      {!isAuthenticated && <p>You are not authenticated. Please log in</p>}
      {isAuthenticated && (
        <div>
          <p>User: {user?.name} (Mail: {user?.email}, User ID: {user?.id})</p>
          <button onClick={handleCheckAuth} style={{ marginRight: '10px' }}>Check Auth</button>
          <button onClick={handleGetProfile} style={{ marginRight: '10px' }}>Get Profile</button>
          {user?.profileImage && (
            <img src={`${user.profileImage}`} alt="Profile Image" className="h-10 w-10 rounded-full fixed top-20 right-20" />
          )}
          <hr />
          <h2>Favorites</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={favoriteData.name}
              onChange={handleFavoriteInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <input
              type="text"
              name="latitude"
              placeholder="Latitude"
              value={favoriteData.latitude}
              onChange={handleFavoriteInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <input
              type="text"
              name="longitude"
              placeholder="Longitude"
              value={favoriteData.longitude}
              onChange={handleFavoriteInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <input
              type="text"
              name="googlePOIId"
              placeholder="Google POI ID"
              value={favoriteData.googlePOIId}
              onChange={handleFavoriteInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <button onClick={handleAddFavorite} style={{ marginRight: '10px' }}>Add to Favorite</button>
            <label style={{ marginRight: '10px' }}>Select Tour:</label>
            <select
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              style={{ marginRight: '10px' }}
            >
              <option value="">-- Select a Tour --</option>
              {toursList.map(tour => (
                <option key={tour._id} value={tour._id}>
                  {tour.title} ({tour.destination})
                </option>
              ))}
            </select>
            <button onClick={handleAddLocationToTour} style={{ marginRight: '10px' }}>Add to Tour</button>
          </div>
          <div>
            <h3>Favorites List:</h3>
            <ul>
              {favoritesList.map((fav) => (
                <li key={fav._id}>
                  {fav.name} ({fav.latitude}, {fav.longitude}) | Favorite _id: {fav._id} | POI: {fav.googlePOIId} | User: {fav.user} |
                  <button onClick={() => handleDeleteFavorite(fav._id)} style={{ marginLeft: '10px' }}>Delete</button> |
                  <select
                    value={favoriteTourMapping[fav._id] || ""}
                    onChange={(e) => handleFavoriteTourChange(fav._id, e.target.value)}
                    style={{ marginLeft: '10px' }}
                  >
                    <option value="">-- Select a Tour --</option>
                    {toursList.map(tour => (
                      <option key={tour._id} value={tour._id}>
                        {tour.title}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleAddFavoriteToTour(fav)} style={{ marginLeft: '10px' }}>
                    Add to Tour
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <hr />
          <h2>Tours</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="title"
              placeholder="Tour Title"
              value={tourData.title}
              onChange={handleTourInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <input
              type="text"
              name="destination"
              placeholder="Destination (City, Country)"
              value={tourData.destination}
              onChange={handleTourInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <input
              type="text"
              name="startDate"
              placeholder="Start Date (YYYY-MM-DD)"
              value={tourData.startDate}
              onChange={handleTourInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <input
              type="text"
              name="endDate"
              placeholder="End Date (YYYY-MM-DD)"
              value={tourData.endDate}
              onChange={handleTourInputChange}
              className="border border-black mr-2 px-2 py-1"
            />
            <button onClick={handleCreateTour} style={{ marginRight: '10px' }}>Add this Tour</button>
          </div>
          <div>
            <h3>Tours List:</h3>
            <ul>
              {toursList.map((tour) => (
                <li key={tour._id}>
                  <div>
                    {tour.title} - {tour.destination} | ({tour.startDate} to {tour.endDate}), Duration: {tour.duration} | Tour _ID: {tour._id}, Tour User ID: {tour.user_id}
                  </div>

                  {tour.days && tour.days.length > 0 && (
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {tour.days.map((day) => (
                        <li key={day._id}>
                          <div>
                            <strong>Day:</strong> {new Date(day.date).toLocaleDateString()}
                          </div>
                          {day.locations && day.locations.length > 0 && (
                            <ul style={{ marginLeft: '20px' }}>
                              {day.locations.map((loc) => (
                                <li key={loc._id}>
                                  {loc.name ? loc.name : 'No name'} ({loc.latitude}, {loc.longitude})
                                   | Favorite _id: {loc._id}
                                   | POI: {loc.googlePOIId} |
                                  <button onClick={() => handleRemoveLocationFromTour(tour._id, day._id, loc._id!)} style={{ marginLeft: '10px' }}>
                                    Delete
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button onClick={() => handleGetTourById(tour._id)} style={{ marginLeft: '10px' }}>Get Tour by ID</button>
                  <button onClick={() => handleUpdateTour(tour._id)} style={{ marginLeft: '10px' }}>Update</button>
                  <button onClick={() => handleDeleteTour(tour._id)} style={{ marginLeft: '10px' }}>Delete</button>
                  <hr style={{ marginTop: '10px' }} />
                </li>

              ))}
            </ul>
          </div>
          <hr />
          <h2>Upload Profile Image</h2>
          <form onSubmit={handleUploadProfileImage} encType="multipart/form-data">
            <input type="file" name="profileImage" onChange={handleFileChange} />
            <button type="submit">Upload Profile Image</button>
          </form>
        </div>
      )}
      <hr />
      <h2>Response:</h2>
      <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap' }}>
        {responseMessage}
      </pre>
    </div>
  );
}

export default FunctionTest;
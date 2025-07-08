import styles from './Map.module.css'
import Button from './Button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'country-flag-icons/3x2/flags.css';

import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvent } from 'react-leaflet';

import { useCities } from '../context/CitiesContext'
import { useGeolocation } from '../hooks/useGeolocation';
import { useUrlPosition } from './../hooks/useUrlPosition';

function emojiToCountryCode(emoji) {
  const codePoints = [...emoji].map(char => char.codePointAt(0) - 127397);
  return String.fromCharCode(...codePoints).toLowerCase();
}


function MapView() {
    const { cities } = useCities();
    const [mapPosition, setMapPosition] = useState([40, 0]);

    const { isLoading: isLoadingPosition, position: geoLocationPosition, getPosition } = useGeolocation();

    const [mapLat, mapLng] = useUrlPosition();

    // This effect runs when the URL's "lat" and "lng" search parameters change.
    // It sets the map center to the location from the URL (e.g., when a user clicks on a city).
    useEffect(() => {
        if (mapLat && mapLng) setMapPosition([mapLat, mapLng])
    }, [mapLat, mapLng])

    // This effect runs when the user's geolocation is successfully retrieved.
    // It updates the map center to the user's current position.
    useEffect(() => {
        if (geoLocationPosition) setMapPosition([geoLocationPosition.lat, geoLocationPosition.lng])
    }, [geoLocationPosition])

    return (
        <div className={styles.mapContainer}>
            {!geoLocationPosition && <Button type='position' onClick={getPosition}>
                {isLoadingPosition ? 'Loading..' : 'User your position'}
            </Button>}
            <MapContainer
                center={mapPosition}
                zoom={6}
                scrollWheelZoom={false}
                className={styles.map}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />
                {cities.map((city) => (
                    <Marker position={[city.position.lat, city.position.lng]} key={city.id}>
                        <Popup>
                            <p className={`flag-icon flag-icon-${emojiToCountryCode(city.emoji)}`}></p>
                            <span>{city.cityName}</span>
                        </Popup>
                    </Marker>
                ))}
                <ChangeCenter position={mapPosition} />
                <DetectClick />
            </MapContainer>
        </div>
    )
}

function ChangeCenter({ position }) {
    const map = useMap();
    map.setView(position);
    return null;
}

function DetectClick() {
    const navigate = useNavigate();
    useMapEvent({
        click: (e) => {
            navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
        }
    })
}

export default MapView
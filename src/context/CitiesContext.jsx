import { createContext, useCallback, useContext, useEffect, useReducer } from "react"

const CitiesContext = createContext();

const BASE_URL = 'http://localhost:9000';

function reducer(state, action) {
    switch (action.type) {
        case 'loading':
            return { ...state, isLoading: true }
        case 'cities/loaded':
            return { ...state, isLoading: false, cities: action.payload }
        case 'city/loaded':
            return { ...state, isLoading: false, currentCity: action.payload }
        case 'city/added':
            return { ...state, isLoading: false, cities: [...state.cities, action.payload], currentCity: action.payload }
        case 'city/deleted':
            return { ...state, isLoading: false, cities: state.cities.filter(city => city.id !== action.payload), currentCity: {} }
        case 'rejected':
            return { ...state, isLoading: false, error: action.payload }
        default:
            throw new Error('Unknown action type')
    }
}

const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: ''
};

function CititesProvider({ children }) {
    const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        async function fetchCities() {
            dispatch({ type: 'loading' })
            try {
                const res = await fetch(`${BASE_URL}/cities`);
                const data = await res.json();
                dispatch({ type: 'cities/loaded', payload: data })
            } catch {
                dispatch({ type: 'rejected', payload: 'There was an error loading data ...' })
            }
        }

        fetchCities();
    }, []);

    const getCity = useCallback(async function getCity(id) {
        if (Number(id) === currentCity.id) return;
        dispatch({ type: 'loading' })
        try {
            const res = await fetch(`${BASE_URL}/cities/${id}`);
            const data = await res.json();
            dispatch({ type: 'city/loaded', payload: data })
        } catch (err) {
            dispatch({ type: 'rejected', payload: 'There was an error loading data ...' })
        }
    }, [currentCity.id])

    async function addCity(newCity) {
        dispatch({ type: 'loading' })
        try {
            const res = await fetch(`${BASE_URL}/cities`, {
                method: 'POST',
                body: JSON.stringify(newCity),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            dispatch({ type: 'city/added', payload: data });
        } catch (err) {
            dispatch({ type: 'rejected', payload: 'There was an error creating city ...' })
        }
    }

    async function deleteCity(id) {
        dispatch({ type: 'loading' })
        try {
            await fetch(`${BASE_URL}/cities/${id}`, {
                method: 'DELETE',
            });
            dispatch({ type: 'city/deleted', payload: id });
        } catch (err) {
            dispatch({ type: 'rejected', payload: 'There was an error deleting city ...' })
        }
    }

    return (
        <CitiesContext.Provider value={{ cities, isLoading, currentCity, getCity, addCity, deleteCity, error }}>
            {children}
        </CitiesContext.Provider>
    )
}

function useCities() {
    const context = useContext(CitiesContext);
    if (context === undefined) {
        throw new Error('CititesContext is used outside the CitiesProvider')
    }
    return context
}


export { CititesProvider, useCities };
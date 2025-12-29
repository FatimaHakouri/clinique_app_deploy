const API_URL = "http://localhost:8080/api/specialities";

export const getSpecialities = () => {
    return fetch(API_URL).then(res => res.json());
};

export const getSpecialityById = (id) => {
    return fetch(`${API_URL}/${id}`).then(res => res.json());
};

export const createSpeciality = (data) => {
    return fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
};

export const updateSpeciality = (id, data) => {
    return fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
};

export const deleteSpeciality = (id) => {
    return fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
};

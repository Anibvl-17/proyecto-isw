import axios from "./root.service";

export const getPeriodos = async () => {
  try {
    const response = await axios.get("/periodos");
    const { status, data } = response;
    if (status === 200) {
      return data.data;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createPeriodo = async (data) => {
  try {
    const response = await axios.post("/periodos", data);
    const { status, data: responseData } = response;
    if (status === 201) {
      return responseData;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updatePeriodo = async (id, data) => {
  try {
    const response = await axios.put(`/periodos/${id}`, data);
    const { status, data: responseData } = response;
    if (status === 200) {
      return responseData;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deletePeriodo = async (id) => {
  try {
    const response = await axios.delete(`/periodos/${id}`);
    const { status } = response;
    if (status === 200) {
      return true;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
import axiosClient from "../../axiosClient";

const EMPLOYEE_API_URL = "/employee";

export const createEmployee = async (employeeData: any) => {
    try {
        const response = await axiosClient.post(EMPLOYEE_API_URL, employeeData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// services/employeeService.ts
export const updateEmployee = async (payload: { id: number | string, employeeData: FormData }) => {
  const { id, employeeData } = payload;

  try {
    const response = await axiosClient.put(`${EMPLOYEE_API_URL}/${id}`, employeeData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEmployee = async (id: number | string) => {
  try {
    const response = await axiosClient.delete(`${EMPLOYEE_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchEmployees = async () => {
    try {
        const response = await axiosClient.get(EMPLOYEE_API_URL);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const countEmployee = async () => {
  try {
    const response = await axiosClient.get(`${EMPLOYEE_API_URL}/count`);
    return response.data
  } catch (error) {
    throw error;
  }
}

export const fetchEmployeeByPid = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${EMPLOYEE_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


import axios, { type Method } from "axios";
import type {  RequestData } from "./requestbody.model";

export const error = (error, data?) => {
  return { status: "error", isSuccessful: false, message: error, data };
};

export const success = (data) => {
  return {
    status: "success",
    isSuccessful: true,
    message: "",
    data: data,
  };
};

export const getAuthHeaders = () => {
  return {
    Authorization: "Bearer " + localStorage.getItem("AUTH_TOKEN"),
  };
};

export const get = async (url, headers?) => {
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${headers}` },
    });
    if (response.status === 200) {
      return success(response.data);
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    console.log(e);
    if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  }
};

export const put = async (url, data, headers) => {
  try {
    const response = await axios.put(url, data, { headers });
    if (response.data.httpStatus === 200) {
      return success(response.data.data);
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    console.log(e);
    if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  }
};

export const post = async (url, data, headers?) => {
  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${headers}` },
    });
    if (response.status === 201 || response.status === 200) {
      return success(response.data);
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    if (e.message) {
      return error(e.message);
    } else if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  }
};


export const makeRequest = async(method:Method, url:string, requestData?:RequestData)=>{
   await axios({
    method:"POST",
    url: '',
    data:requestData.data,
    headers:requestData?.headers,
   })
}

makeRequest("GET","shjksh",{data:{
  "asif":10,
  "asif1":"uwyuiwyui",
  "asif2":true,
},headers:{
  "Authorio":"asjkghsjikhs",
  "Authori2o":"shjkgyjsgiyus"
}})


//------------- We need this function in future ------------------//

// export const download = async (url, data, headers) => {
//   try {
//     let response = null;
//     if (data === null) {
//       response = await axios.get(url, {
//         headers,
//         responseType: "blob",
//       });
//     } else {
//       response = await axios.post(url, data, {
//         headers,
//         responseType: "blob",
//       });
//     }
//     var contentDisposition = response.headers["content-disposition"];
//     var filename = contentDisposition.match(/filename=(?<filename>[^,;]+);/)[0];
//     return success({
//       file: response.data,
//       filename: filename
//         .split("=")[1]
//         .replace(";", "")
//         .replace('"', "")
//         .replace('"', ""),
//     });
//   } catch (e) {
//     console.log(e);
//     if (e.response.data) {
//       let errorString = JSON.parse(await e.response.data.text());
//       return errorString;
//     }
//     return error(e);
//   }
// };

export const update = async (url, data, headers) => {
  try {
    const response = await axios.put(url, data, { headers });
    if (response.data.httpStatus === 200) {
      return success(response.data.data);
    } else {
      return error(response.data.statusMessage);
    }
  } catch (e) {
    console.log(e);
    if (e.response.data) {
      return error(e.response.data.statusMessage);
    }
    return error(e);
  }
};

export const del = async (url, headers) => {
  try {
    const response = await axios.delete(url, { headers });
    if (response.data.httpStatus === 200) {
      return success(response.data.data);
    } else {
      return error(response.data.statusMessage, response.data.data);
    }
  } catch (e) {
    console.log(e);
    if (e.response.data) {
      return error(e.response.data.statusMessage, e.response.data.data);
    }
    return error(e);
  }
};

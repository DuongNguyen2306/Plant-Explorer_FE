// 📁 utils/roleUtils.js
export const getUserRoleFromAPI = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      return null;
    }
  
    console.log("Token found:", token);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  
    const roles = ["children", "staff", "admin"];
    for (let role of roles) {
      try {
        console.log(`Fetching role: ${role}`);
        const res = await fetch(`https://plant-explorer-backend-0-0-1.onrender.com/api/auth/${role}`, {
          method: "GET",
          headers,
        });
        console.log(`Response for /api/auth/${role}: Status ${res.status}`, await res.text());
        if (res.ok) {
          console.log(`Role confirmed: ${role}`);
          return role;
        }
      } catch (err) {
        console.error(`Error fetching role ${role}:`, err);
        continue;
      }
    }
  
    console.warn("No matching role found. Check backend response.");
    return null;
  };
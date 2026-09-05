import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({
children,
allowedRoles = [],
}) {
const location = useLocation();

let user = null;

try {
const storedUser = localStorage.getItem("user");

if (storedUser) {
  user = JSON.parse(storedUser);
}

} catch (error) {
console.error(
"Invalid user data in localStorage:",
error
);

localStorage.removeItem("user");

}

const token = localStorage.getItem("token");

// ==========================================
// NOT LOGGED IN
// ==========================================

if (!user || !token) {
return (
<Navigate
to="/login"
replace
state={{
from: location.pathname,
}}
/>
);
}

// ==========================================
// ROLE PROTECTION
// ==========================================

if (
allowedRoles.length > 0 &&
!allowedRoles.includes(user.role)
) {
// Counsellor trying to access student page
if (user.role === "counsellor") {
return (
<Navigate to="/counsellor-dashboard" replace />
);
}

// Student trying to access counsellor page
if (user.role === "student") {
  return (
    <Navigate
      to="/"
      replace
    />
  );
}

// Unknown role
return (
  <Navigate
    to="/login"
    replace
  />
);

}

return children;
}

export default ProtectedRoute;
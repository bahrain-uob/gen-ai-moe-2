import { AuthContext } from '../AuthContext';
import { useContext, useEffect } from 'react';
import { /*Link,*/ useNavigate } from 'react-router-dom';

const AdminUserCheck = () => {
const navigate = useNavigate();
const authInfo = useContext(AuthContext)

useEffect(()=>{
const adminUserCheck = async () => {
    // Checking if user info exists in the context
    if (authInfo) {
      // Extract institution from the idToken payload
      const institution = authInfo.authSession?.tokens?.idToken?.payload['custom:Institution'] as string;
      console.log("INSTITUTION:", institution)
      // Redirect based on the institution
      if (institution?.toUpperCase() != 'MOE') {
        navigate('/');
      }
    };
  };
  adminUserCheck();
})
}
export default AdminUserCheck;
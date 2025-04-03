import { AuthContext } from '../AuthContext';
import { useContext/*, useEffect*/ } from 'react';
import { /*Link,*/ useNavigate } from 'react-router-dom';

const authInfo = useContext(AuthContext);
const navigate = useNavigate();
const adminUserCheck = async () => {
    // Checking if user info exists in the context
    if (authInfo) {
      // Extract institution from the idToken payload
      const institution = authInfo.authSession?.tokens?.idToken?.payload['custom:Institution'] as string;

      // Redirect based on the institution
      if (institution?.toUpperCase() !== 'MOE') {
        navigate('/'); // Redirect to /admin-home for admins
      }
    }
  };
export default adminUserCheck;
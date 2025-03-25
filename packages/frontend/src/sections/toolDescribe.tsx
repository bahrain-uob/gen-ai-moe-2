// import { Link } from 'react-router-dom';



// const toolDescribe = () => {
//   return (
//     <section className="w-full flex-1 flex flex-col lg:flex-row gap-10 max-container justify-center lg:gap-56 pb-10 bg-blue-4  " >
    

//       <div className="relative xl:w-2/4 flex flex-col justify-center items-center w-full max-xl:padding-x pt-27 text-white ">
//         <h1 className="text-4xl font-bold leading-tight tracking-wider text-center font-montserrat  pb-10 mt-20 lg:text-4xl">
//         Unlock Your Potential with Personalized Learning
//         </h1>
//         <h2 className='text-center font-montserrat pb-10'
//         >Get your English level up by practicing set of Tests and Exercises </h2>
//         <Link to="/Home">
//         <button className="before:ease relative h-12 w-40 mb-10 overflow-hidden border border-[#AFA8A0] text-[#AFA8A0]  bg-white shadow-md transition-all before:absolute before:top-1/2 before:h-0 before:w-64 before:origin-center before:-translate-x-20 before:rotate-45 before:bg-[#AFA8A0] before:duration-300 hover:text-white hover: hover:before:h-64 hover:before:-translate-y-32">
//           <span className="relative z-10 font-bold text-1xl">Get Started</span>
//         </button>
//         </Link>
//       </div>
//     </section>
//   );
// };

// export default toolDescribe;
import { useContext/*, useEffect*/ } from 'react';
import { /*Link,*/ useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const toolDescribe = () => {
  const navigate = useNavigate();
  const authInfo = useContext(AuthContext);

  //useEffect(() => {
    const fetchUserInstitution = async () => {
      // Checking if user info exists in the context
      if (authInfo) {
        // Extract institution from the idToken payload
        const institution = authInfo.authSession?.tokens?.idToken?.payload['custom:Institution'] as string;

        // Redirect based on the institution
        if (institution?.toUpperCase() === 'MOE') {
          navigate('/admin-home'); // Redirect to /admin-home for admins
        } else {
          navigate('/home'); // Redirect to /home for other users (e.g., students)
        }
      }
    };

    // if (authInfo) {
    //   fetchUserInstitution(); // Fetch user institution if user is authenticated
    // }
  //}, [authInfo, navigate]);

  return (
    <section className="w-full flex-1 flex flex-col lg:flex-row gap-10 max-container justify-center lg:gap-56 pb-10 bg-blue-4">
      <div className="relative xl:w-2/4 flex flex-col justify-center items-center w-full max-xl:padding-x pt-27 text-white">
        <h1 className="text-4xl font-bold leading-tight tracking-wider text-center font-montserrat pb-10 mt-20 lg:text-4xl">
          Unlock Your Potential with Personalized Learning
        </h1>
        <h2 className="text-center font-montserrat pb-10">
          Get your English level up by practicing set of Tests and Exercises
        </h2>
        
          <button onClick={fetchUserInstitution} className="before:ease relative h-12 w-40 mb-10 overflow-hidden border border-[#AFA8A0] text-[#AFA8A0] bg-white shadow-md transition-all before:absolute before:top-1/2 before:h-0 before:w-64 before:origin-center before:-translate-x-20 before:rotate-45 before:bg-[#AFA8A0] before:duration-300 hover:text-white hover: hover:before:h-64 hover:before:-translate-y-32">
            <span className="relative z-10 font-bold text-1xl">Get Started</span>
          </button>
        
      </div>
    </section>
  );
};

export default toolDescribe;

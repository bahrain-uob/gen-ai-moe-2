import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignIn() {
  // Hard-coded email and password for testing
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test@123');
  const [passwordShown, setPasswordShown] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSignIn = () => {
    console.log(
      `Attempting to sign in with email: ${email} and password: ${password}`,
    );
    // Mocking Cognito's signIn method for testing
    if (email === 'test@example.com' && password === 'Test@123') {
      toast.success('Signed in successfully', {
        onClose: () => navigate('/adminhome'), // Redirect to adminhome on successful sign-in
      });
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grey-1">
      <div className="w-full flex justify-between items-center px-5 lg:px-10 py-5">
        <h1 className="text-xl font-bold text-blue-4">LINGUI</h1>
        <Link to="/" className="text-xl text-blue-4">
          Home
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-5">
        <div className="w-full sm:max-w-[26rem] md:max-w-[26rem] lg:max-w-[30rem] flex flex-col justify-center px-6 py-6 lg:py-10 lg:px-8 bg-white rounded-md shadow-lg">
          <ToastContainer />
          <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
            <h1 className="mb-6 mt-3 lg:mb-10 text-center text-3xl font-roboto leading-9 tracking-tight text-gray-900">
              Sign in
            </h1>
          </div>

          <div className="mt-7">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                type="email"
                value={email}
                autoComplete="off"
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-md border border-blue-4 py-1.5 pl-4"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="relative mt-2 w-full">
              <input
                type={passwordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block w-full rounded-md border border-blue-4 py-1.5 pl-4 pr-10"
              />
              {passwordShown ? (
                <BsEyeSlash
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  size="35"
                />
              ) : (
                <BsEye
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  size="35"
                />
              )}
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={handleSignIn}
              className="flex w-full justify-center rounded-md bg-blue-4 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className="font-semibold leading-6 text-blue-4 hover:text-blue-3"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

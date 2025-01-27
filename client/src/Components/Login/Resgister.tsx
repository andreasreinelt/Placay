import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen dark">
      <div className="w-full max-w-md bg-gray-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-black mb-4">Create a new account on <span className="text-[#0366fc]">Placay</span></h2>
        <div className="text-sm font-normal mb-4 text-center text-black">Sign up to get started</div>
        <form className="flex flex-col gap-3">
          <div className="block relative">
            <label htmlFor="name" className="block text-black cursor-text text-sm leading-[140%] font-normal mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              className="bg-gray-500 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150 w-full"
            />
          </div>
          <div className="block relative">
            <label htmlFor="email" className="block text-black cursor-text text-sm leading-[140%] font-normal mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="bg-gray-500 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150 w-full"
            />
          </div>
          <div className="block relative">
            <label htmlFor="password" className="block text-black cursor-text text-sm leading-[140%] font-normal mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="bg-gray-500 text-gray-200 border-0 rounded-md p-2 mb-4 focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150 w-max m-auto cursor-pointer"
          >
            Register
          </button>
        </form>
        <div className="text-sm text-center mt-[1.6rem] text-black">
          Already have an account?{' '}
          <Link className="text-sm text-[#0366fc]" to="/login">
            Log in here!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

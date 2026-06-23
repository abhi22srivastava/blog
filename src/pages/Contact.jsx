import { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile:"",
    message: "",
  });
 const [errors, setErrors] = useState({});
 const [loading, setLoading] = useState(false);
const [isSubmitted, setIsSubmitted] = useState(false);

const validateForm = () => {
  let newErrors = {};

  // Name Validation
  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }

  // Email Validation
  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
  ) {
    newErrors.email = "Invalid email address";
  }

  // Mobile Validation
  if (!formData.mobile.trim()) {
    newErrors.mobile = "Mobile number is required";
  } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
    newErrors.mobile = "Mobile number must be 10 digits";
  }

  // Message Validation
  if (!formData.message.trim()) {
    newErrors.message = "Message is required";
  } else if (formData.message.length < 10) {
    newErrors.message = "Message must be at least 10 characters";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/contact",
      formData
    );

    setFormData({
      name: "",
      email: "",
      mobile: "",
      message: "",
    });

    setErrors({});
    setIsSubmitted(true);
  } catch (error) {
    console.log(error);
    alert("Something went wrong!");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Header />
    
      <section className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            
            {/* Left Side */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Contact Us
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Have questions or need assistance? Fill out the form and our
                team will get back to you as soon as possible.
              </p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-lg">📧 Email</h3>
                  <p className="text-gray-600">support@example.com</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-lg">📞 Phone</h3>
                  <p className="text-gray-600">+91 9876543210</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-lg">📍 Address</h3>
                  <p className="text-gray-600">
                    Surat, Gujarat, India
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Form */}
            <div className="bg-white shadow-xl rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                Send Message
              </h2>


              {isSubmitted ? (
  <div className="text-center animate-pulse py-10">
    <div className="text-6xl mb-4">✅</div>

    <h2 className="text-3xl font-bold text-green-600 mb-2">
      Message Sent Successfully!
    </h2>

    <p className="text-gray-600">
      Thank you for contacting us. Our team will get back to you soon.
    </p>
  </div>
) : (
 
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                   className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}


                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                {errors.email && (
  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
)}

                </div>


                  <div>
                  <label className="block text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Enter your Mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                {errors.mobile && (
  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
)}

                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Write your message..."
                    value={formData.message}
                    onChange={handleChange}
                    
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />

               {errors.message && (
  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
)}

                </div>

               <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 shadow-md disabled:opacity-70"
>
  {loading ? (
    <div className="flex justify-center items-center gap-2">
      <svg
        className="animate-spin h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
        />
        <path
          fill="currentColor"
          className="opacity-75"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      Sending...
    </div>
  ) : (
    "Send Message"
  )}
</button>
              </form>
              )}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;
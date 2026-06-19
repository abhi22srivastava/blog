import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function Contact() {
  return (
    <>
    <div className="container mx-auto px-6 py-10">
         <Header />
      <h1 className="text-4xl font-bold mb-4">
        Contact Us
      </h1>

      <form className="max-w-lg space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-3 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
        />

        <textarea
          rows="5"
          placeholder="Message"
          className="w-full border p-3 rounded"
        ></textarea>

        <button className="bg-blue-600 text-white px-6 py-3 rounded">
          Send Message
        </button>
      </form>
    </div>
       <Footer />
      </> 
  );
}

export default Contact;
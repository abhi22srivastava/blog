import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

function About() {
  return (
    <>
    <div className="container mx-auto px-6 py-10">
        <Header />
      <h1 className="text-4xl font-bold mb-4">
        About Us
      </h1>

      <p className="text-gray-600">
        Welcome to MyBlog. We share articles about
        React, JavaScript, Web Development, and
        Programming.
      </p>
    </div>
      <Footer />
    </>
  );
}

export default About;
import Header from "../components/Header";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-pulse">
            About Our Company
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            We help businesses grow through innovative digital solutions,
            cutting-edge technology, and exceptional customer service.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="transform hover:scale-105 transition duration-500">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="Team"
              className="rounded-2xl shadow-2xl"
            />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Our Story
            </h2>

            <p className="text-gray-600 mb-4 leading-8">
              Founded with a vision to transform businesses digitally, we have
              spent years delivering world-class solutions to clients across
              multiple industries.
            </p>

            <p className="text-gray-600 leading-8">
              Our team combines creativity, technology, and strategy to create
              exceptional experiences that help brands stand out in competitive
              markets.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Projects Completed" },
              { number: "150+", label: "Happy Clients" },
              { number: "10+", label: "Years Experience" },
              { number: "25+", label: "Team Members" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:-translate-y-3 transition duration-500"
              >
                <h3 className="text-4xl font-bold text-blue-600 mb-2">
                  {item.number}
                </h3>
                <p className="text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <div className="bg-blue-50 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition duration-500">
            <h3 className="text-3xl font-bold text-blue-600 mb-4">
              Our Mission
            </h3>

            <p className="text-gray-600 leading-8">
              To empower businesses through innovative technology solutions,
              helping them achieve sustainable growth and long-term success.
            </p>
          </div>

          <div className="bg-indigo-50 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition duration-500">
            <h3 className="text-3xl font-bold text-indigo-600 mb-4">
              Our Vision
            </h3>

            <p className="text-gray-600 leading-8">
              To become a trusted global leader in digital transformation,
              delivering value-driven solutions that shape the future.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-14">
            Meet Our Team
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "John Smith",
                role: "CEO & Founder",
              },
              {
                name: "Sarah Johnson",
                role: "Creative Director",
              },
              {
                name: "Michael Brown",
                role: "Lead Developer",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:scale-105 transition duration-500"
              >
                <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {member.name}
                  </h3>

                  <p className="text-gray-500 mt-2">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Let's Build Something Amazing Together
          </h2>

          <p className="text-lg mb-8">
            Ready to take your business to the next level? Our team is here to
            help you succeed.
          </p>

          <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:scale-105 transition duration-300">
            Contact Us
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;
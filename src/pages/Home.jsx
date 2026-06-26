import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Home() {
  const [blogs, setBlogs] = useState([]);

  // useEffect(() => {
  //   fetch("https://jsonplaceholder.typicode.com/posts?_limit=10")
  //     .then((res) => res.json())
  //      .then((response) => {
  //      console.log(response); 
  //      setBlogs(response.data);
  //    })
  //     .catch((err) => console.log(err));
  // }, []);

 

  

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/blog/")
      .then((res) => res.json())
      .then((response) => {
        setBlogs(response.data);
        // console.log(response.data);
      })
    .catch((err) => console.log(err));
  }, []);

 

  

  return (
    <>
    <Header/>
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold">
            Welcome to Our Blog 
          </h1>
          <p className="mt-4 text-lg">
            Read the latest articles and updates.
          </p>
        </div>
      </section>

      {/* Recent Posts Slider */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">
          Recent Posts
        </h2>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {blogs.map((blog) => (
            <SwiperSlide key={blog.id}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
             
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-3">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    

                     {blog.long_description.replace(/<\/?[^>]+(>|$)/g, "")}
                    {/* {blog.long_description} */}
                  </p>
                 

                  <Link
                    to={`/blog/${blog.id}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
    <Footer/>
    </>
  );
}

export default Home;
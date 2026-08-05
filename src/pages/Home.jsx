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
  const stories = [
  {
    id: 1,
    title: "The Future of AI in 2026",
    category: "Technology",
    date: "July 7, 2026",
    image: "https://picsum.photos/id/180/200/150",
  },
  {
    id: 2,
    title: "React 20 New Features",
    category: "Programming",
    date: "July 6, 2026",
    image: "https://picsum.photos/id/0/200/150",
  },
  {
    id: 3,
    title: "Top Travel Destinations",
    category: "Travel",
    date: "July 5, 2026",
    image: "https://picsum.photos/id/1015/200/150",
  },
  {
    id: 4,
    title: "Healthy Lifestyle Guide",
    category: "Health",
    date: "July 4, 2026",
    image: "https://picsum.photos/id/292/200/150",
  },
];

const categories = [
  { name: "Technology", total: 125 },
  { name: "Programming", total: 98 },
  { name: "Business", total: 86 },
  { name: "Health", total: 74 },
  { name: "Travel", total: 61 },
  { name: "Education", total: 48 },
];


const authors = [
  {
    id: 1,
    name: "John Smith",
    role: "Technology Writer",
    articles: 125,
    followers: "18K",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "React Expert",
    articles: 98,
    followers: "14K",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 3,
    name: "David Wilson",
    role: "Laravel Developer",
    articles: 86,
    followers: "11K",
    image: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: 4,
    name: "Emily Brown",
    role: "AI Researcher",
    articles: 74,
    followers: "22K",
    image: "https://i.pravatar.cc/150?img=9",
  },

];



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
    

<section className="bg-gray-100 py-10">
  <div className="max-w-7xl mx-auto px-6">
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      className="rounded-2xl overflow-hidden shadow-xl"
    >
      {blogs.slice(0, 5).map((blog) => (
        <SwiperSlide key={blog.id}>
          <div className="grid lg:grid-cols-2 bg-white">

            {/* Left Image */}
            <div className="relative">
              <img
                src="https://picsum.photos/900/700"
                alt={blog.title}
                className="w-full h-[550px] object-cover"
              />

              <span className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                ⭐ Featured
              </span>
            </div>

            {/* Right Content */}
            <div className="flex items-center p-10">
              <div>

                <span className="text-blue-600 font-semibold uppercase">
                  Technology
                </span>

                <h1 className="text-5xl font-bold mt-4 leading-tight">
                  {blog.title}
                </h1>

                <p className="text-gray-600 mt-6 text-lg line-clamp-5">
                  {blog.long_description.replace(/<\/?[^>]+(>|$)/g, "")}
                </p>

                <div className="flex items-center gap-6 mt-8 text-gray-500">
                  <span>👤 John Doe</span>
                  <span>📅 July 2026</span>
                  <span>⏱ 8 min read</span>
                </div>

                <Link
                  to={`/blog/${blog.id}`}
                  className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition"
                >
                  Read Full Article →
                </Link>

              </div>
            </div>

          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</section>

<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">

    <div className="flex justify-between items-center mb-10">
      <div>
        <h2 className="text-4xl font-bold">🔥 Trending Articles</h2>
        <p className="text-gray-500 mt-2">
          Most read articles this week.
        </p>
      </div>

      <Link
        to="/blog"
        className="text-blue-600 font-semibold hover:underline"
      >
        View All →
      </Link>
    </div>

    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={25}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      breakpoints={{
        320: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
        1280: {
          slidesPerView: 4,
        },
      }}
    >
      {blogs.slice(0, 8).map((blog, index) => (
        <SwiperSlide key={blog.id}>
          <Link to={`/blog/${blog.id}`}>

            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">

              <div className="relative">

                <img
                  src={`https://picsum.photos/600/400?random=${blog.id}`}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                />

                <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  🔥 #{index + 1}
                </span>

              </div>

              <div className="p-5">

                <span className="text-blue-600 text-sm font-semibold">
                  Technology
                </span>

                <h3 className="font-bold text-xl mt-2 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-gray-500 mt-3 line-clamp-3">
                  {blog.long_description.replace(/<\/?[^>]+(>|$)/g, "")}
                </p>

                <div className="flex justify-between mt-5 text-sm text-gray-400">
                  <span>👁 2.5K Views</span>
                  <span>⏱ 5 min read</span>
                </div>

              </div>

            </div>

          </Link>
        </SwiperSlide>
      ))}
    </Swiper>

  </div>
</section>

 <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              🔥 Popular Stories
            </h2>

            <Swiper
              direction="vertical"
              slidesPerView={3}
              spaceBetween={20}
              loop={true}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
              className="h-[430px]"
            >
              {stories.map((story) => (
                <SwiperSlide key={story.id}>
                  <Link to={`/blog/${story.id}`}>
                    <div className="flex gap-4 border rounded-lg p-3 hover:shadow-md transition">

                      <img
                        src={story.image}
                        className="w-36 h-24 rounded-lg object-cover"
                        alt={story.title}
                      />

                      <div>

                        <span className="text-sm text-blue-600 font-semibold">
                          {story.category}
                        </span>

                        <h3 className="font-bold text-lg mt-2 hover:text-blue-600">
                          {story.title}
                        </h3>

                        <p className="text-gray-500 text-sm mt-2">
                          {story.date}
                        </p>

                      </div>
                      
                      

                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

          </div>

          {/* Right */}
          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              📂 Popular Categories
            </h2>

            <div className="space-y-4">

              {categories.map((cat, index) => (
                <Link
                  key={index}
                  to={`/category/${cat.name.toLowerCase()}`}
                >
                 <div className="flex justify-between items-center border rounded-xl px-5 py-4 mb-2 hover:bg-blue-50 hover:shadow-md transition-all duration-300">

                    <span className="font-semibold">
                      {cat.name}
                    </span>

                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {cat.total}
                    </span>

                  </div>
                </Link>
              ))}

            </div>

          </div>

        </div>

      </div>
    </section>

<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4">

    <div className="flex justify-between items-center mb-10">
      <div>
        <h2 className="text-3xl font-bold">
          👨‍💻 Top Authors
        </h2>
        <p className="text-gray-500 mt-2">
          Meet our most popular content creators.
        </p>
      </div>

      <Link
        to="/authors"
        className="text-blue-600 font-semibold hover:underline"
      >
        View All →
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

      {authors.map((author) => (
        <div
          key={author.id}
          className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition p-6 text-center"
        >
          <img
            src={author.image}
            alt={author.name}
            className="w-24 h-24 rounded-full mx-auto border-4 border-blue-100"
          />

          <h3 className="text-xl font-bold mt-4">
            {author.name}
          </h3>

          <p className="text-blue-600 text-sm mt-1">
            {author.role}
          </p>

          <div className="flex justify-center gap-6 mt-5 text-sm text-gray-600">
            <div>
              <p className="font-bold text-lg">{author.articles}</p>
              <span>Articles</span>
            </div>

            <div>
              <p className="font-bold text-lg">{author.followers}</p>
              <span>Followers</span>
            </div>
          </div>

          <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            View Profile
          </button>
        </div>
      ))}

    </div>

  </div>
</section>

  <Footer/>
    </>
  );
}

export default Home;
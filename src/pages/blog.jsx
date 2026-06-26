import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState(8);

  // useEffect(() => {
  //   fetch("https://jsonplaceholder.typicode.com/posts")
  //     .then((res) => res.json())
  //     .then((data) => setBlogs(data))
  //     .catch((err) => console.log(err));
  // }, []);

   useEffect(() => {
    fetch("http://127.0.0.1:8000/api/blog/")
      .then((res) => res.json())
      .then((response) => {
       
        setBlogs(response.data);
        
      })
    .catch((err) => console.log(err));
  }, []);


  const loadMore = () => {
    setTimeout(() => {
      setVisibleBlogs((prev) => prev + 12);
    }, 1000);
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold">Latest Blogs</h1>
            <p className="text-gray-600 mt-2">
              Read our latest articles and updates
            </p>
          </div>

          {/* Infinite Scroll */}
          <InfiniteScroll
            dataLength={visibleBlogs}
            next={loadMore}
            hasMore={visibleBlogs < blogs.length}
            loader={
              <div className="flex justify-center py-5">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
            endMessage={
              <p className="text-center py-5 text-gray-500">
                No more blogs available
              </p>
            }
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.slice(0, visibleBlogs).map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                >
                  <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.body}
                  </p>

                  <Link
                    to={`/blog/${blog.id}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Read More
                  </Link>
                </div>
              ))}
            </div>
          </InfiniteScroll>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Blog;
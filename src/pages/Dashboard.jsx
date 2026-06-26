import Header from "../components/Header";

function Dashboard() {
  const stats = [
    { title: "Total Posts", count: 125, icon: "📝" },
    { title: "Published Articles", count: 98, icon: "📚" },
    { title: "Draft Posts", count: 18, icon: "📄" },
    { title: "Total Views", count: "15.2K", icon: "👀" },
  ];

  const articles = [
    {
      id: 1,
      title: "Getting Started with React",
      date: "20 June 2026",
      status: "Published",
    },
    {
      id: 2,
      title: "Understanding React Hooks",
      date: "18 June 2026",
      status: "Published",
    },
    {
      id: 3,
      title: "Tailwind CSS Complete Guide",
      date: "15 June 2026",
      status: "Draft",
    },
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold">Welcome Back 👋</h1>
          <p className="mt-2 text-lg opacity-90">
            Manage your posts, articles, and content from one place.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm">{item.title}</h3>
                  <p className="text-3xl font-bold mt-2">{item.count}</p>
                </div>
                <span className="text-4xl">{item.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-md mt-8 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">Recent Articles</h2>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Add Article
            </button>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {article.date}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    article.status === "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {article.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold">Create Post</h3>
            <p className="text-gray-500 mt-2">
              Start writing a new blog post.
            </p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
              New Post
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold">Manage Articles</h3>
            <p className="text-gray-500 mt-2">
              Edit and organize your content.
            </p>
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">
              View Articles
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold">Analytics</h3>
            <p className="text-gray-500 mt-2">
              Check post performance and views.
            </p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">
              View Stats
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
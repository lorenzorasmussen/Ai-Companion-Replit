import { db } from "./db";
import { templates } from "@shared/schema";

const initialTemplates = [
  {
    name: "React Todo App",
    description: "A simple todo application with add, delete, and mark complete functionality",
    type: "react",
    icon: "📝",
    content: {
      code: `import React, { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <div className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border rounded-l"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-2"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;`,
      features: ["Add todos", "Mark complete", "Delete todos", "Responsive design"],
      technologies: ["React", "TailwindCSS", "JavaScript"]
    }
  },
  {
    name: "Weather Dashboard",
    description: "Beautiful weather dashboard with current conditions and forecast",
    type: "dashboard",
    icon: "🌤️",
    content: {
      code: `import React, { useState, useEffect } from 'react';

function WeatherDashboard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWeather({
        location: "San Francisco, CA",
        current: {
          temp: 72,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 8
        },
        forecast: [
          { day: "Today", high: 75, low: 60, condition: "Sunny" },
          { day: "Tomorrow", high: 73, low: 58, condition: "Cloudy" },
          { day: "Friday", high: 71, low: 56, condition: "Rainy" }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Weather Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{weather.location}</h2>
          <div className="text-4xl font-bold">{weather.current.temp}°F</div>
          <div className="text-lg">{weather.current.condition}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Current Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Humidity</span>
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span>Wind Speed</span>
              <span>{weather.current.windSpeed} mph</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">3-Day Forecast</h3>
        <div className="grid grid-cols-3 gap-4">
          {weather.forecast.map((day, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold">{day.day}</div>
              <div className="text-sm text-gray-600">{day.condition}</div>
              <div className="mt-2">
                <span className="font-bold">{day.high}°</span>
                <span className="text-gray-500">/{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherDashboard;`,
      features: ["Current weather", "3-day forecast", "Responsive layout", "Loading states"],
      technologies: ["React", "TailwindCSS", "Mock API"]
    }
  },
  {
    name: "Contact Form",
    description: "Professional contact form with validation and submission handling",
    type: "form",
    icon: "📧",
    content: {
      code: `import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate form submission
      setTimeout(() => {
        setSubmitted(true);
      }, 1000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
        <p className="text-green-700">Your message has been sent successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded \${errors.name ? 'border-red-500' : 'border-gray-300'}\`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded \${errors.email ? 'border-red-500' : 'border-gray-300'}\`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={\`w-full px-3 py-2 border rounded \${errors.subject ? 'border-red-500' : 'border-gray-300'}\`}
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className={\`w-full px-3 py-2 border rounded \${errors.message ? 'border-red-500' : 'border-gray-300'}\`}
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

export default ContactForm;`,
      features: ["Form validation", "Error handling", "Success states", "Responsive design"],
      technologies: ["React", "TailwindCSS", "Form validation"]
    }
  },
  {
    name: "Landing Page",
    description: "Modern landing page with hero section, features, and call-to-action",
    type: "website",
    icon: "🚀",
    content: {
      code: `import React from 'react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-2xl font-bold text-gray-900">Brand</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <a href="#contact" className="text-gray-500 hover:text-gray-900">Contact</a>
            </nav>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Build Amazing Apps
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            The fastest way to create beautiful, responsive applications
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to build your next great application
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Built for speed and performance with modern technologies</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure</h3>
              <p className="text-gray-600">Enterprise-grade security to protect your data</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Responsive</h3>
              <p className="text-gray-600">Works perfectly on all devices and screen sizes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of developers building amazing applications
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
            Start Building Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">Brand</div>
            <p className="text-gray-400 mb-4">Building the future, one app at a time.</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;`,
      features: ["Hero section", "Feature showcase", "Responsive navigation", "Call-to-action"],
      technologies: ["React", "TailwindCSS", "Responsive design"]
    }
  }
];

export async function seedDatabase() {
  try {
    console.log("Seeding database with initial templates...");
    
    for (const template of initialTemplates) {
      await db.insert(templates).values({
        name: template.name,
        description: template.description,
        type: template.type,
        icon: template.icon,
        content: template.content
      }).onConflictDoNothing();
    }
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
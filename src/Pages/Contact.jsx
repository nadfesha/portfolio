import React, { useEffect } from "react";
import SocialLinks from "../components/SocialLinks";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactPage = () => {
  useEffect(() => {
    AOS.init({
      once: false,
    });
  }, []);

  return (
    <div className="px-[5%] sm:px-[5%] lg:px-[10%]">
      <div className="text-center lg:mt-[5%] mt-10 mb-10">
        <h2
          data-aos="fade-down"
          data-aos-duration="1000"
          className="inline-block text-3xl md:text-5xl font-bold text-center mx-auto text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FBBF24]"
        >
          <span
            style={{
              color: "#EC4899",
                backgroundImage:
                  "linear-gradient(45deg, #EC4899 10%, #FBBF24 93%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connect With Me
          </span>
        </h2>
        <p
          data-aos="fade-up"
          data-aos-duration="1100"
          className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2"
        >
          Feel free to reach out on any of my social platforms
        </p>
      </div>

      <div
        className="h-auto py-10 flex items-center justify-center"
        id="Contact"
      >
        <div
          data-aos="zoom-in"
          data-aos-duration="1000"
          className="w-full max-w-5xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 transform transition-all duration-500 hover:shadow-[#EC4899]/10"
        >
          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
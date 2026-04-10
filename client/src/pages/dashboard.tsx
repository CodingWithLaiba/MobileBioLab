import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Microscope, Users, GraduationCap, FlaskConical } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ImageCarousel } from "@/components/ui/image-carousel";
import Pic1 from "../../src/images/bio-lab.png";
import Pic2 from "../../src/images/soil-sample.png";
import Pic3 from "../../src/images/water-sample.jpg";
import { Footer } from "@/components/layout/footer";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  // const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <main className="flex-1 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="bg-white border-b border-border">
            <div className="px-8 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold ">
                    Welcome {user?.firstName.toUpperCase()}!
                  </h1>
                  <p className=" mt-1">
                    Here's what's happening in your lab today
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button
                    className="flex items-center"
                    onClick={() => setLocation("/samples")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Sample
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="w-full px-4 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="h-64 md:h-96 rounded-lg shadow-lg text-center text-4xl font-bold text-white">
                <ImageCarousel
                  images={[
                    {
                      src: Pic1,
                      alt: "Modern laboratory equipment",
                      caption: "State-of-the-art mobile bio lab facilities",
                    },
                    {
                      src: Pic2,
                      alt: "Soil sample analysis",
                      caption: "Precise soil sample testing and analysis",
                    },
                    {
                      src: Pic3,
                      alt: "Water quality testing",
                      caption: "Comprehensive water sample examination",
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ABC Laboratories About Section */}
          <div className="w-full px-4 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Microscope className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                 Mobile Bio Lab
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>

              {/* Mission Statement */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-12 border border-gray-100 dark:border-gray-700">
                <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Mobile Bio Lab</span> is dedicated to the 
                  <span className="font-semibold text-purple-600 dark:text-purple-400"> welfare and development</span> in the field of
                  <span className="font-semibold"> medical and biological sciences</span> for the general public, especially for
                  <span className="font-semibold text-green-600 dark:text-green-400"> researchers, students, and technicians</span>.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Mobile Bio Lab Service */}
                <div className="group bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Free Mobile Bio Lab Service
                      </h3>
                      <p className="text-blue-50 leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                        We facilitate scientists, researchers, and students by providing a
                        <span className="font-bold text-white"> free-of-cost mobile bio lab service</span> through our mobile application. 
                        This service is especially beneficial in virtual modes of education where designated campuses are located across the country, 
                        making it difficult for students to access campus bio lab facilities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Lab on Wheels */}
                <div className="group bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <FlaskConical className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Mobile Lab on Wheels
                      </h3>
                      <p className="text-purple-50 leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                        We offer a unique opportunity for people to conduct
                        <span className="font-bold text-white"> practical experiments</span> in a biology lab through our
                        <span className="font-bold text-white"> mobile bio lab on wheels</span>. 
                        This mobile lab, housed in a bus, allows students to use biological equipment to conduct various experiments for educational purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-green-600 dark:text-green-400 mr-3" />
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Hands-On Learning Experience
                  </h3>
                </div>
                <p className="text-lg text-center text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
                  This hands-on experience enables
                  <span className="font-bold text-green-700 dark:text-green-400"> students and researchers</span> to learn and practice using
                  <span className="font-semibold"> biological and medical equipment</span>, bridging the gap between theoretical knowledge and practical application.
                </p>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Microscope className="h-5 w-5" />
                  <span className="font-bold text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Empowering Science Education Everywhere
                  </span>
                </div>
              </div>
            </div>
          </div>

         
        </main>

      </div>
      <Footer />
    </div>
  );
}

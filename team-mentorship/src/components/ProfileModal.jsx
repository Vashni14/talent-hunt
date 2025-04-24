import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUserPlus, 
  FaTimes, 
  FaEnvelope, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe, 
  FaCertificate, 
  FaCode,
  FaUserTie,
  FaMedal 
} from "react-icons/fa";

export default function ProfileModal({ profile, onClose }) {
  // Ensure links are  properly  formatted
  const formatLink = (url) => {
    if (!url) return null;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };
  const linkedinUrl = profile?.linkedin ? formatLink(Array.isArray(profile.linkedin) ? profile.linkedin[0] : profile.linkedin) : null;
  const githubUrl = profile?.github ? formatLink(Array.isArray(profile.github) ? profile.github[0] : profile.github) : null;
  const portfolioUrl = profile?.portfolio ? formatLink(Array.isArray(profile.portfolio) ? profile.portfolio[0] : profile.portfolio) : null;

  //  Skill  level  to  color  mapping
  const getSkillLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'beginner': return 'bg-blue-500/10  text-blue-400';
      case 'intermediate': return 'bg-purple-500/10  text-purple-400';
      case 'advanced': return 'bg-green-500/10  text-green-400';
      case 'expert': return 'bg-yellow-500/10  text-yellow-400';
      default: return 'bg-gray-500/10  text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {profile  &&  (
        <motion.div
          initial={{  opacity:  0  }}
          animate={{  opacity:  1  }}
          exit={{  opacity:  0  }}
          className="fixed  inset-0  bg-black/70  flex  items-center  justify-center  z-50  p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{  scale:  0.95  }}
            animate={{  scale:  1  }}
            exit={{  scale:  0.95  }}
            className="bg-gray-800  rounded-xl  p-6  w-full  max-w-4xl  border  border-gray-700  shadow-xl  overflow-y-auto  max-h-[90vh]"
            onClick={(e)  =>  e.stopPropagation()}
          >
            {/*  Header  */}
            <div  className="flex  justify-between  items-start  mb-6">
              <div>
                <h2  className="text-2xl  font-bold  text-white">{profile.name}</h2>
                <div  className="flex  gap-2  items-center">
                  {profile.domain  &&  (
                    <span  className="text-blue-400">{profile.domain}</span>
                  )}
                  {profile.rolePreference  &&  (
                    <span  className="text-gray-400  text-sm  flex  items-center  gap-1">
                      <FaUserTie  className="text-xs"  />  {profile.rolePreference}
                    </span>
                  )}
                </div>
              </div>
              <button  
                onClick={onClose}
                className="text-gray-400  hover:text-white  p-1"
              >
                <FaTimes  className="text-xl"  />
              </button>
            </div>

            <div  className="grid  md:grid-cols-3  gap-8">
              {/*  Left  Column  -  Profile  Info  */}
              <div  className="md:col-span-1">
                <div  className="flex  flex-col  items-center">
                  <div  className="w-32  h-32  rounded-full  overflow-hidden  border-4  border-blue-500/50  mb-4">
                    <img
                      src={profile?.profilePicture  ?  `http://localhost:5000${profile.profilePicture}`  :  "/default-profile.png"}
                      alt={profile.name}
                      className="w-full  h-full  object-cover"
                      onError={(e)  =>  {
                        e.target.onerror  =  null;
                        e.target.src  =  "https://ui-avatars.com/api/?name=User&background=random";
                      }}
                    />
                  </div>
                  <div  className="text-center  mb-6">
                    <p  className="text-sm  text-gray-400  mb-1">Status</p>
                    <span  className={`px-3  py-1  rounded-full  text-xs  font-medium  ${
                      profile.availability  ===  "Available"  
                        ?  "bg-green-500/20  text-green-400"  
                        :  "bg-red-500/20  text-red-400"
                    }`}>
                      {profile.availability  ||  "Available"}
                    </span>
                  </div>
                </div>

                {/*  Contact  Info  */}
                <div  className="bg-gray-700/50  rounded-lg  p-4  mb-4">
                  <h3  className="font-medium  text-white  mb-3  flex  items-center  gap-2">
                    <FaEnvelope  className="text-gray-400"  />  Contact
                  </h3>
                  <p  className="text-sm  text-gray-300">{profile.contact  ||  "Not  provided"}</p>
                </div>

                {/*  Social  Links  */}
                <div  className="bg-gray-700/50  rounded-lg  p-4  space-y-3">
                  <h3  className="font-medium  text-white  mb-2">Social  Links</h3>
                  {linkedinUrl  &&  (
                    <div  className="flex  items-center  gap-2  text-sm  text-gray-300  hover:text-blue-400  transition-colors">
                      <FaLinkedin  className="text-blue-400"  />
                      <a  href={linkedinUrl}  target="_blank"  rel="noopener  noreferrer"  className="truncate">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {githubUrl  &&  (
                    <div  className="flex  items-center  gap-2  text-sm  text-gray-300  hover:text-blue-400  transition-colors">
                      <FaGithub  />
                      <a  href={githubUrl}  target="_blank"  rel="noopener  noreferrer"  className="truncate">
                        GitHub
                      </a>
                    </div>
                  )}
                  {portfolioUrl  &&  (
                    <div  className="flex  items-center  gap-2  text-sm  text-gray-300  hover:text-blue-400  transition-colors">
                      <FaGlobe  className="text-green-400"  />
                      <a  href={portfolioUrl}  target="_blank"  rel="noopener  noreferrer"  className="truncate">
                        Portfolio
                      </a>
                    </div>
                  )}
                  {!linkedinUrl  &&  !githubUrl  &&  !portfolioUrl  &&  (
                    <p  className="text-gray-400  text-sm">No  social  links  provided</p>
                  )}
                </div>
              </div>

              {/*  Right  Column  -  Detailed  Info  */}
              <div  className="md:col-span-2  space-y-6">
                {/*  About  Section  */}
                <div>
                  <h3  className="text-lg  font-semibold  text-white  mb-3  pb-2  border-b  border-gray-700">
                    About
                  </h3>
                  <p  className="text-gray-300">
                    {profile.bio  ||  "This  user  hasn't  added  a  bio  yet."}
                  </p>
                </div>

                {/*  Skills  Section  -  Updated  to  show  levels  */}
                <div>
                  <h3  className="text-lg  font-semibold  text-white  mb-3  pb-2  border-b  border-gray-700">
                    Skills  ({profile.skills?.length  ||  0})
                  </h3>
                  {profile.skills?.length  >  0  ?  (
                    <div  className="space-y-3">
                      {profile.skills.map((skill,  idx)  =>  {
                        const  skillName  =  typeof  skill  ===  'object'  ?  skill.name  :  skill;
                        const  skillLevel  =  typeof  skill  ===  'object'  ?  skill.level  :  'Intermediate';
                        return  (
                          <div  key={idx}  className="space-y-1">
                            <div  className="flex  justify-between  items-center">
                              <span  className="text-gray-300">{skillName}</span>
                              <span  className="text-xs  text-gray-400  capitalize">{skillLevel}</span>
                            </div>
                            <div  className="w-full  bg-gray-600  rounded-full  h-1.5">
                              <div  
                                className={`h-1.5  rounded-full  ${
                                  skillLevel?.toLowerCase()  ===  'beginner'  ?  'bg-blue-500  w-1/4'  :
                                  skillLevel?.toLowerCase()  ===  'intermediate'  ?  'bg-purple-500  w-1/2'  :
                                  skillLevel?.toLowerCase()  ===  'advanced'  ?  'bg-green-500  w-3/4'  :
                                  'bg-yellow-500  w-full'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )  :  (
                    <p  className="text-gray-400">No  skills  listed</p>
                  )}
                </div>

                {/*  Projects  Section  -  Fixed  */}
                <div>
                  <h3  className="text-lg  font-semibold  text-white  mb-3  pb-2  border-b  border-gray-700">
                    Projects  ({profile.projects?.length  ||  0})
                  </h3>
                  {profile.projects?.length  >  0  ?  (
                    <ul  className="space-y-2">
                      {profile.projects.map((project,  idx)  =>  (
                        <li  key={idx}  className="flex  items-start  gap-2">
                       <FaCode  className="text-blue-400  mt-1  flex-shrink-0"  />
                          <span  className="text-gray-300">{project}</span>
                        </li>
                      ))}
                    </ul>
                  )  :  (
                    <p  className="text-gray-400">No  projects  listed</p>
                  )}
                </div>

                {/*  Competitions  Section  */}
                <div>
                  <h3  className="text-lg  font-semibold  text-white  mb-3  pb-2  border-b  border-gray-700">
                    Competition  Experience  ({profile.competitions?.length  ||  0})
                  </h3>
                  {profile.competitions?.length  >  0  ?  (
                    <ul  className="space-y-2">
                       {profile.competitions.map((comp, idx) => (
                <span key={idx} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  {comp.competition} {/* Render name property instead of object */}
                </span>
              ))}
                    </ul>
                  )  :  (
                    <p  className="text-gray-400">No  competition  experience  listed</p>
                  )}
                </div>

                {/*  Certifications  Section  -  Fixed  */}
                <div>
                  <h3  className="text-lg  font-semibold  text-white  mb-3  pb-2  border-b  border-gray-700">
                    Certifications  ({profile.certifications?.length  ||  0})
                  </h3>
                  {profile.certifications?.length  >  0  ?  (
                    <ul  className="space-y-2">
                      {profile.certifications.map((certification,  idx)  =>  (
                        <li  key={idx}  className="flex  items-start  gap-2">
                           <FaCertificate  className="text-green-400  mt-1  flex-shrink-0"  />
                          <span  className="text-gray-300">{certification}</span>
                        </li>
                      ))}
                    </ul>
                  )  :  (
                    <p  className="text-gray-400">No certification listed</p>
                  )}
                </div>
              </div>
            </div>

            {/*  Footer  with  Action  Buttons  */}
            <div  className="mt-8  pt-5  border-t  border-gray-700  flex  justify-end  gap-3">
              <button
                onClick={onClose}
                className="px-4  py-2  bg-gray-700  hover:bg-gray-600  text-white  rounded-lg  transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
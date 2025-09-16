import { motion } from "framer-motion";

const Loading = () => {
    return ( 
    <div className="p-10 flex justify-center items-center">
      <motion.div
        className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
     );
}
 
export default Loading;

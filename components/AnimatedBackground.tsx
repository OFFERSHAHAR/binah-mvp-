'use client'

import { motion } from 'framer-motion'

export const AnimatedBackground = () => {
  const blobVariants = {
    animate: {
      x: [0, 26, 0],
      y: [0, -30, 0],
      transition: {
        duration: 22,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  const blobVariantsB = {
    animate: {
      x: [0, -28, 0],
      y: [0, 22, 0],
      transition: {
        duration: 26,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  }

  return (
    <>
      {/* Blob 1 - Purple/Blue */}
      <motion.div
        className="absolute w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{
          right: '-160px',
          top: '-180px',
          background:
            'radial-gradient(circle at 40% 40%, rgba(214, 199, 255, 0.5), transparent 70%)',
          filter: 'blur(40px)',
        }}
        variants={blobVariants}
        animate="animate"
      />

      {/* Blob 2 - Green/Teal */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          left: '-150px',
          bottom: '-160px',
          background:
            'radial-gradient(circle at 50% 50%, rgba(182, 239, 212, 0.45), transparent 70%)',
          filter: 'blur(44px)',
        }}
        variants={blobVariantsB}
        animate="animate"
      />
    </>
  )
}

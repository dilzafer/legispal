'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Github, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const founders = [
  {
    name: 'Dilzafer Singh',
    image: '/dilzafer-pfp.jpg',
    bio: 'Econ & CS @ Harvard',
  },
  {
    name: 'Jeffrey Zhou',
    image: '/jeffrey-pfp.jpeg',
    bio: 'CS & Math @ Harvard',
  },
  {
    name: 'Hasnain Rizvi',
    image: '/hasnain-pfp.jpeg',
    bio: 'MIS @ Texas A&M',
  },
  {
    name: 'Joshua Zyzak',
    image: '/Joshua Zyzak pfp.png',
    bio: 'EE & CS @ Harvard',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -mx-8 -my-6 px-8 py-6">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-white/10 -mx-8 px-8 -mt-6 pt-6 mb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/"
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors -ml-2"
            >
              <ArrowLeft className="text-white" size={20} />
            </Link>
            <h1 className="text-xl font-bold text-white">About Oversight</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Making Democracy Transparent
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Born from the frustration of navigating complex government data, Oversight was created by four students
            with a shared passion for civic engagement and technological innovation.
          </p>
        </motion.div>

        {/* The Problem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 bg-slate-900/50 rounded-2xl p-8 border border-white/10"
        >
          <h3 className="text-2xl font-semibold text-white mb-4">The Challenge</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Modern legislation has evolved into an increasingly complex landscape where comprehensive appropriations bills,
            omnibus packages, and reconciliation measures often consolidate hundreds of disparate policy provisions into
            single legislative vehicles. This practice of "legislative bundling" compresses diverse regulatory frameworks,
            fiscal allocations, and policy riders into consolidated texts that can span thousands of pages.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The expedited legislative calendar, combined with the technical density of statutory language, creates
            significant barriers to meaningful civic engagement. Citizens deserve tools that can parse complex legislative
            instruments, extract actionable insights, and present governmental data in an accessible format—enabling
            informed participation in our democratic process.
          </p>
        </motion.div>

        {/* Built at HackHarvard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 text-center"
        >
          <div className="inline-block bg-democracy-gold/10 border border-democracy-gold/30 rounded-lg px-6 py-3">
            <p className="text-democracy-gold font-semibold">
              🏆 Built at HackHarvard 2025
            </p>
          </div>
        </motion.div>

        {/* Founders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">Meet the Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-slate-900/50 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-800">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{founder.name}</h4>
                <p className="text-sm text-gray-400">{founder.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16 bg-gradient-to-r from-truth-green/10 to-democracy-gold/10 rounded-2xl p-8 border border-white/10"
        >
          <h3 className="text-2xl font-semibold text-white mb-4 text-center">Our Mission</h3>
          <p className="text-gray-300 leading-relaxed text-center max-w-3xl mx-auto">
            We believe that transparency is the cornerstone of democracy. By leveraging advanced AI and data visualization
            technologies, we're breaking down the barriers between citizens and their government, making complex legislative
            information accessible, understandable, and actionable for everyone.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center pb-16"
        >
          <p className="text-gray-400 mb-4">Have questions or feedback?</p>
          <div className="flex justify-center gap-6">
            <a
              href="mailto:dsingh@college.harvard.edu"
              className="inline-flex items-center gap-2 text-truth-green hover:text-truth-green/80 transition-colors"
            >
              <Mail size={20} />
              <span>Get in touch</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

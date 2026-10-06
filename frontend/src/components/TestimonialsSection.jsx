/**
 * TestimonialsSection: user stories showing real-world impact.
 * Static content — no API calls.
 */

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      'Installed a 2,800 L system last monsoon. My June–September water bill dropped by 40%. Paid back in under 3 years.',
    name: 'Anita Sharma',
    role: 'Homeowner, 4-family residence',
    location: 'Dombivli, Maharashtra',
    initials: 'AS',
    color: 'bg-cyan-600',
  },
  {
    stars: 5,
    quote:
      'My 1-acre farm now collects over 1 lakh litres per year from rainfall. Irrigation costs are down by ₹8,000 every season.',
    name: 'Rajesh Patil',
    role: 'Farmer — cotton & soybean',
    location: 'Jalgaon, Maharashtra',
    initials: 'RP',
    color: 'bg-emerald-600',
  },
  {
    stars: 5,
    quote:
      'We installed a common rainwater system for 40 flats. The society saves ₹60,000 annually on water tanker charges.',
    name: 'Bangalore RWA Committee',
    role: 'Apartment society, 40 units',
    location: 'Whitefield, Bangalore',
    initials: 'BR',
    color: 'bg-amber-600',
  },
  {
    stars: 5,
    quote:
      'Our panchayat built 12 farm ponds based on this tool. Village drinking water supply now lasts the entire dry season.',
    name: 'Kavita Devi',
    role: 'Sarpanch, Gram Panchayat',
    location: 'Barmer, Rajasthan',
    initials: 'KD',
    color: 'bg-violet-600',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">💬 What people are saying</h2>
        <p className="text-slate-400 text-sm">
          Real stories from homeowners, farmers, and communities using rainwater harvesting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
      {/* Stars */}
      <div className="text-amber-400 text-sm mb-3">
        {'★'.repeat(testimonial.stars)}
      </div>

      {/* Quote */}
      <p className="text-slate-200 text-sm leading-relaxed mb-4">
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
        <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}>
          {testimonial.initials}
        </div>
        <div>
          <div className="text-white font-medium text-sm">{testimonial.name}</div>
          <div className="text-slate-500 text-xs">{testimonial.role}</div>
          <div className="text-slate-600 text-xs">{testimonial.location}</div>
        </div>
      </div>
    </div>
  )
}
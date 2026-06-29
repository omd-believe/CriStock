export default function StatCard({ label, value }) {
  return (
    <div className="bg-[#12121A] rounded-xl p-5 border border-white/5">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
}
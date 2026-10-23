export default function BrandMark({ compact = false }) {
  return (
    <div className="text-center text-white">
      <div className="mb-4 flex justify-center">
        <svg width="65" height="84" viewBox="0 0 65 84" fill="none" aria-hidden="true">
          <path d="M8 82V46L20 40V82M23 82V18L38 10V82M41 82V34L53 40V82M56 82V57L63 62V82" stroke="white" strokeWidth="3" fill="white" fillOpacity=".16"/>
          <path d="M3 83H65" stroke="white" strokeWidth="2"/>
        </svg>
      </div>
      <p className="text-[10px] font-bold tracking-wide text-white/90">ENCIMERAS DE MÁRMOL Y GRANITO</p>
      <p className={`mt-2 font-serif tracking-[.12em] ${compact ? "text-xl" : "text-[23px]"}`}>LA PROVIDENCIA</p>
    </div>
  );
}

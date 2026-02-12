'use client';

// Manuell Trustpilot-visning (oppdater anmeldelsene her)
const reviews = [
  {
    name: 'Thomas K.',
    rating: 5,
    date: '2024-12-15',
    text: 'Fantastisk hjelp med å sette opp krypto-wallet. Forklarte alt på en enkel og forståelig måte. Anbefales!',
  },
  {
    name: 'Marte S.',
    rating: 5,
    date: '2024-11-20',
    text: 'Veldig profesjonell og kunnskapsrik. Fikk god veiledning om sikkerhet og beste praksis.',
  },
  {
    name: 'Erik L.',
    rating: 5,
    date: '2024-10-08',
    text: 'Rask respons og grundig gjennomgang. Følte meg trygg på å komme i gang med krypto etterpå.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-[#00b67a]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TrustpilotReviews() {
  return (
    <div className="space-y-6">
      {/* Trustpilot header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <svg className="h-8" viewBox="0 0 126 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M33.752 10.662h-6.727V5.405h18.262v5.257h-6.727v18.12h-4.808v-18.12z" fill="#191919"/>
          <path d="M44.962 11.205h4.57v3.263h.068c.272-.816.762-1.565 1.483-2.244.72-.68 1.755-1.02 3.1-1.02.34 0 .67.017.993.051.323.034.611.085.865.153v4.46a6.027 6.027 0 00-1.177-.204 9.04 9.04 0 00-1.007-.051c-.884 0-1.636.136-2.257.408a4.011 4.011 0 00-1.534 1.122 4.586 4.586 0 00-.875 1.7 7.174 7.174 0 00-.28 2.04v7.899h-4.95V11.205z" fill="#191919"/>
          <path d="M67.135 28.782h-4.876v-2.567h-.068a4.917 4.917 0 01-1.992 2.21c-.858.543-1.874.815-3.049.815-2.448 0-4.213-.631-5.295-1.894-1.082-1.263-1.622-3.123-1.622-5.58V11.204h4.95v9.75c0 1.467.276 2.525.832 3.177.554.65 1.372.976 2.452.976.815 0 1.5-.128 2.053-.382a3.484 3.484 0 001.347-1.07 4.452 4.452 0 00.739-1.648 8.391 8.391 0 00.222-1.99v-8.812h4.95v17.577h-.643z" fill="#191919"/>
          <path d="M73.12 23.85c.137.883.52 1.538 1.151 1.962.631.425 1.381.637 2.248.637.306 0 .66-.03 1.058-.093a3.55 3.55 0 001.058-.34c.323-.17.59-.39.806-.665.215-.272.316-.62.306-1.04-.012-.424-.17-.772-.476-1.044a4.017 4.017 0 00-1.16-.697 11.746 11.746 0 00-1.571-.502 47.498 47.498 0 00-1.737-.408 19.593 19.593 0 01-1.856-.527 6.628 6.628 0 01-1.673-.85 4.206 4.206 0 01-1.211-1.353c-.306-.552-.459-1.246-.459-2.082 0-.918.218-1.691.654-2.321a5.133 5.133 0 011.686-1.547 7.569 7.569 0 012.308-.858 12.28 12.28 0 012.537-.264c.835 0 1.65.093 2.444.28.795.186 1.517.484 2.163.893a5.178 5.178 0 011.587 1.597c.407.65.669 1.422.79 2.312h-5.002c-.187-.748-.544-1.268-1.073-1.563-.527-.294-1.134-.442-1.822-.442-.238 0-.5.022-.79.067a2.813 2.813 0 00-.773.237 1.676 1.676 0 00-.586.459c-.153.187-.23.432-.23.733 0 .373.155.68.467.918.31.238.71.437 1.203.595.49.16 1.04.303 1.646.434.607.128 1.223.277 1.848.442.62.168 1.228.378 1.822.63a5.98 5.98 0 011.622.942c.476.39.856.866 1.143 1.427.289.561.432 1.237.432 2.03 0 .987-.221 1.834-.663 2.543a5.473 5.473 0 01-1.754 1.759 7.914 7.914 0 01-2.469.993 12.516 12.516 0 01-2.825.323c-.972 0-1.908-.106-2.808-.315a7.313 7.313 0 01-2.392-1c-.697-.459-1.27-1.052-1.72-1.784-.45-.731-.72-1.614-.815-2.65h5.002v-.001z" fill="#191919"/>
          <path d="M92.502 11.205h3.727v3.432h-3.727v8.166c0 .578.11.985.332 1.223.221.238.646.357 1.27.357.221 0 .436-.01.646-.025.209-.017.42-.06.628-.127v3.84a9.805 9.805 0 01-1.279.17c-.492.033-.976.05-1.457.05-.765 0-1.475-.066-2.128-.195a4.183 4.183 0 01-1.635-.68 3.182 3.182 0 01-1.049-1.3c-.247-.543-.372-1.22-.372-2.031v-9.45h-3.084v-3.43h3.084V5.864h4.95v5.34h.094z" fill="#191919"/>
          <path d="M100.165 11.205h4.706v2.617h.068a4.747 4.747 0 011.899-2.287c.843-.526 1.843-.79 3-.79 1.174 0 2.188.256 3.041.766.857.51 1.481 1.296 1.874 2.362h.052c.457-.969 1.153-1.754 2.087-2.354.934-.6 2.052-.9 3.355-.9 1.735 0 3.096.56 4.082 1.675.985 1.115 1.478 2.79 1.478 5.02v11.468h-4.95V18.52c0-1.11-.216-1.929-.646-2.456-.431-.527-1.063-.79-1.899-.79-.952 0-1.673.313-2.163.941-.49.629-.735 1.523-.735 2.686v9.88h-4.95v-10.16c0-1.043-.208-1.843-.621-2.397-.414-.556-1.038-.833-1.874-.833-.986 0-1.724.322-2.214.968-.489.646-.732 1.565-.732 2.763v9.659h-4.95V11.205h.092z" fill="#191919"/>
          <path d="M12.744 9.753L15.6 0l2.858 9.753h-5.714z" fill="#00b67a"/>
          <path d="M3.692 18.87l8.974-6.522H4.782L0 18.87h3.692z" fill="#00b67a"/>
          <path d="M5.754 18.87l6.912 5.022 2.79-8.544-9.702 3.522z" fill="#005128"/>
          <path d="M12.666 23.892l2.856 8.785 2.79-8.544-5.646-.24z" fill="#00b67a"/>
          <path d="M15.522 24.133l9.702-3.523-8.912-6.262-2.79 8.544 2 1.24z" fill="#005128"/>
          <path d="M26.4 18.87l-4.782-6.522h-8.952l8.974 6.522H26.4z" fill="#00b67a"/>
        </svg>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-gray-800">Utmerket</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-[#00b67a]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <StarRating rating={review.rating} />
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium text-gray-800">{review.name}</span>
              <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('nb-NO')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Link to Trustpilot */}
      <div className="text-center pt-4">
        <a
          href="https://www.trustpilot.com/review/kryptohjelpen.no"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#00b67a] hover:text-[#009567] font-medium transition-colors"
        >
          Se alle anmeldelser på Trustpilot
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

import React from 'react';

export const PayPalDonation: React.FC = () => {
  return (
    <form
      action="https://www.paypal.com/cgi-bin/webscr"
      method="post"
      target="_blank"
      className="inline-flex items-center"
    >
      <input type="hidden" name="cmd" value="_s-xclick" />
      <input type="hidden" name="hosted_button_id" value="44VG35XYRJUCW" />
      <button
        type="submit"
        className="flex items-center space-x-1 px-3 py-1.5 bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-medium rounded transition-colors"
        title="Support FlightJobs with a donation."
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.724c2.838 0 5098.567 5.098 3.567 0 0-1.436 0-2.6l-.008-.048c-.03-.157-.053-.318-.053-.485 0-2.183 1.697-4.073 4.612-4.073 1.293 0 2.28.336 2.82.978.508.604.638 1.452.373 2.393-.02.074-.044.145-.066.218l-.002.007-.86 3.33c-.463 1.84-.097 3.207.999 4.014.447.324.987.507 1.577.507 2.086 0 3.84-1.539 4.633-3.92.148-.47.233-.963.233-1.468 0-2.79-2.282-5.06-5.089-5.06-.534 0-1.049.083-1.532.234-.064.019-.127.04-.19.062-.29.102-.537.246-.733.422-.148.134-.363.145-.526.025l-.128-.094c-.257-.19-.444-.52-.444-.886 0-.595.483-1.078 1.078-1.078h6.14c.324 0 .63-.15.83-.406l1.66-2.09a1.08 1.08 0 0 0-.848-1.746H9.47c-.493 0-.968.188-1.33.527l-.003.003a1.994 1.994 0 0 0-.54 1.159L4.946 20.597a.641.641 0 0 0 .633.74h1.497z"/>
        </svg>
        <span>Donate</span>
      </button>
    </form>
  );
};

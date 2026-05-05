const FormInput = ({ label, ...props }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 font-semibold">{label}</label>
    <input
      className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default FormInput;
const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <section className="  w-full items-center flex justify-center text-red-500">
      <h1 className="text-md border-b border-red-500 w-fit">{message}</h1>
    </section>
  );
};

export default ErrorMessage;

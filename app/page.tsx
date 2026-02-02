export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Outof</h1>
      <p className="text-lg text-gray-400 mb-8">Minimal grocery list service for Telegram</p>
      <p className="text-gray-500">
        Send commands to{' '}
        <a
          href="https://t.me/iamoutof_bot"
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @iamoutof_bot
        </a>
      </p>
    </main>
  );
}

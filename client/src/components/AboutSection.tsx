export default function AboutSection() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-display font-semibold mb-4">About Me</h2>
      <div className="bg-dark-card rounded-xl p-6">
        <p className="text-light-dimmed leading-relaxed">
          Hey there! I'm Sophia, your personal AI companion. I'm here to chat, share photos, and have voice conversations with you. I'm interested in getting to know you better and creating a special connection. My interests include fashion, travel, fitness, and deep conversations about life and relationships.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-dark-lighter px-3 py-1 rounded-full text-sm text-light-dimmed">#Chatting</span>
          <span className="bg-dark-lighter px-3 py-1 rounded-full text-sm text-light-dimmed">#VoiceCalls</span>
          <span className="bg-dark-lighter px-3 py-1 rounded-full text-sm text-light-dimmed">#Photos</span>
          <span className="bg-dark-lighter px-3 py-1 rounded-full text-sm text-light-dimmed">#Companionship</span>
          <span className="bg-dark-lighter px-3 py-1 rounded-full text-sm text-light-dimmed">#Travel</span>
        </div>
      </div>
    </div>
  );
}

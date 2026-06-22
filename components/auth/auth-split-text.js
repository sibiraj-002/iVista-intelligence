import { cn } from "@/utils/cn";

export function AuthSplitWords({ className, text, wordClassName }) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          className="mr-[0.28em] inline-block overflow-hidden align-top last:mr-0"
          key={`${word}-${index}`}
        >
          <span className={cn("inline-block", wordClassName)} data-auth-word>
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

export function AuthSplitChars({ className, text }) {
  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <span className="inline-block overflow-hidden align-top" key={`${char}-${index}`}>
          <span className="inline-block" data-auth-char>
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}

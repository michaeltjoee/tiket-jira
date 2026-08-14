import { LOGGER_ENV_TOKEN } from "@/lib/logger";
import type { LoggerLink } from "@/lib/logger";

type Props = {
  links: LoggerLink[];
};

const LoggerLinks = ({ links }: Props) => {
  if (links.length === 0) {
    return <p className="empty">Add logger links in the config.</p>;
  }

  return (
    <ul className="log_list">
      {links.map((link) => (
        <li key={`${link.environment}-${link.label}-${link.href}`}>
          <a
            className="log_row"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={`log_env log_env_${link.environment}`}>
              {LOGGER_ENV_TOKEN[link.environment]}
            </span>
            <span className="log_label">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default LoggerLinks;

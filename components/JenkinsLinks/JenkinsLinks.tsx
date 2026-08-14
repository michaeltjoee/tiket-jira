import { JENKINS_ENV_TOKEN } from "@/lib/jenkins";
import type { JenkinsLink } from "@/lib/jenkins";

type Props = {
  links: JenkinsLink[];
};

const JenkinsLinks = ({ links }: Props) => {
  if (links.length === 0) {
    return <p className="empty">Add Jenkins links in the config.</p>;
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
              {JENKINS_ENV_TOKEN[link.environment]}
            </span>
            <span className="log_label">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default JenkinsLinks;

import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer">
      <p>© {new Date().getFullYear()} IZ Security System. All Rights Reserved.</p>

      <div className="footer-links">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
      </div>
    </div>
  );
}

export default Footer;

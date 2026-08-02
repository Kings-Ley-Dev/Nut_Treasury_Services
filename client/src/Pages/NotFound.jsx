import { Link } from "react-router-dom";
import "./Inner.css";

const NotFound = () => (
  <div className="notfound">
    <div className="container">
      <span className="nf-nut">🌰</span>
      <h1>404</h1>
      <h2>This seed never sprouted</h2>
      <p>The page you're looking for has moved or doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg">Back to home</Link>
    </div>
  </div>
);

export default NotFound;

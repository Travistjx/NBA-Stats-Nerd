import { CSSTransition } from "react-transition-group";

function SideBar({ isVisible }) {
  return (
    <CSSTransition
      in={isVisible}
      timeout={500}
      classNames="my-transition"
      unmountOnExit
    >
      <div>yes</div>
    </CSSTransition>
  );
}

export default SideBar;

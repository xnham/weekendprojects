import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faHeart as fasHeart, 
  faShareNodes,
  faEye,
  faBell as fasBell, 
  faUser, 
  faPerson, 
  faHouseChimneyWindow, 
  faBriefcase,
  faTreeCity,
  faAngleLeft,
  faAngleRight,
  faComment as fasComment,
  faArrowUpRightFromSquare,
  faShareFromSquare as fasShareFromSquare,
  faInfoCircle,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { 
  faHeart as farHeart, 
  faBell as farBell,
  faComment as farComment,
  faShareFromSquare as farShareFromSquare,
  faEnvelope as farEnvelope,
  faCopy as farCopy
} from '@fortawesome/free-regular-svg-icons';

// Add icons to the library
library.add(
  fasHeart, 
  farHeart,
  fasBell,
  farBell,
  faUser,
  faPerson,
  faHouseChimneyWindow,
  faBriefcase,
  faTreeCity,
  faAngleLeft,
  faAngleRight,
  fasComment,
  farComment,
  faArrowUpRightFromSquare,
  fasShareFromSquare,
  farShareFromSquare,
  faInfoCircle,
  faPhone,
  farEnvelope,
  farCopy,
  faShareNodes,
  faEye
); 
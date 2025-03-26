import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faHeart as fasHeart, 
  faBell as fasBell, 
  faUser, 
  faPerson, 
  faHouseChimneyWindow, 
  faBriefcase,
  faTreeCity
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart, faBell as farBell } from '@fortawesome/free-regular-svg-icons';

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
  faTreeCity
);

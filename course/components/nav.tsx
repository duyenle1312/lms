

import AvatarBadge from "./avatar-badge";

export type User = {
  user_id: string;
  name: string;
  create_at: string;
  email: string;
  password: string;
  role: string;
};

const Navigation = () => {

  return (
    <div className="flex md:flex-row flex-col justify-between border-b-2 md:px-16 px-6">
      <div className="py-5 space-x-5">
        <a href="/" className="font-bold text-blue-800">
          Home
        </a>
        <a href="/search" className="font-bold text-blue-800">
          Search
        </a>
        <a href="/welcome" className="font-bold text-blue-800">
          Topic
        </a>
        <a href="/assign-user" className="font-bold text-blue-800">
          Dashboard
        </a>
        <a href="/enrollment" className="font-bold text-blue-800">
          Enrollment
        </a>
      </div>

      <div className="flex justify-center align-middle items-center gap-x-3">
        <AvatarBadge/>
      </div>
    </div>
  );
};

export default Navigation;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

type Profile = {
  user_id: string;
  name: string;
  profile_pic_url?: string;
};

type PostType = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profile?: Profile;
  like_count?: number;
  comment_count?: number;
  liked_by_user?: boolean;
  likes_list?: { user_id: string; profile?: Profile }[];
  comments_list?: any[];
};

type Props = {
  post: PostType;
  user: User | null;
  onLike: (postId: string, liked: boolean) => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, existingContent: string) => void;
  onEditSubmit: (e: React.FormEvent) => void;
  editingPostId: string | null;
  editContent: string;
  setEditContent: (text: string) => void;
  showComments: boolean;
  toggleShowComments: (postId: string) => void;
  commentsList: any[] | undefined;
  commentInput: string;
  handleCommentInput: (postId: string, value: string) => void;
  handleAddComment: (e: React.FormEvent, postId: string) => void;
  submittingComment: boolean | undefined;
};

export const Post: React.FC<Props> = ({
  post,
  user,
  onLike,
  onDelete,
  onEdit,
  onEditSubmit,
  editingPostId,
  editContent,
  setEditContent,
  showComments,
  toggleShowComments,
  commentsList,
  commentInput,
  handleCommentInput,
  handleAddComment,
  submittingComment,
}) => {
  const navigate = useNavigate();

  return (
    <li className="border rounded p-3 bg-white shadow">
      <div className="flex items-center mb-2">
        {post.profile?.profile_pic_url ? (
          <img
            src={post.profile.profile_pic_url}
            className="w-8 h-8 rounded-full mr-2 cursor-pointer"
            alt={post.profile.name || "user"}
            title="View user's profile"
            onClick={() => navigate(`/profile/${post.user_id}`)}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center cursor-pointer"
            title="View user's profile"
            onClick={() => navigate(`/profile/${post.user_id}`)}
          >
            <span role="img" aria-label="avatar" className="text-lg">👤</span>
          </div>
        )}
        <Link
          to={`/profile/${post.user_id}`}
          className="font-bold hover:underline text-black"
        >
          {post.profile?.name || "User"}
        </Link>
        <span className="ml-auto text-xs text-gray-500">
          {new Date(post.created_at).toLocaleString("en-GB")}
        </span>
      </div>
      <div className="mb-2 whitespace-pre-line break-words text-black">
        {editingPostId === post.id ? (
          <form onSubmit={onEditSubmit}>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="border rounded w-full p-1 mb-2 text-black"
              rows={2}
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded"
                onClick={() => onEdit("", "")}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {post.content}
            {post.image_url && (
              <img
                src={post.image_url}
                alt="user upload"
                className="mt-2 rounded max-h-64 object-contain w-full"
              />
            )}
          </>
        )}
      </div>
      {/* Likes and Comments buttons under the picture */}
      <div className="flex justify-between items-center text-sm pt-2">
        {/* Comments button on left */}
        <button
          onClick={() => toggleShowComments(post.id)}
          className="flex items-center px-2 py-1 rounded bg-gray-200 text-gray-800 font-semibold"
        >
          <span role="img" aria-label="comment" className="mr-1">💬</span>
          {post.comment_count || 0}
        </button>
        {/* Like button on right */}
        <button
          onClick={() => onLike(post.id, !!post.liked_by_user)}
          className={`flex items-center px-2 py-1 rounded font-semibold ${
            post.liked_by_user ? "text-pink-600" : "text-gray-800 hover:text-pink-600"
          }`}
        >
          <span role="img" aria-label="like" className="mr-1">
            {post.liked_by_user ? "❤️" : "👍"}
          </span>
          {post.like_count || 0}
        </button>
      </div>
      {/* Likes list, darker text */}
      {post.likes_list && post.likes_list.length > 0 && (
        <div className="px-1 pt-1 pb-2 text-gray-900 font-medium text-sm">
          <span className="text-gray-800">Liked by </span>
          {post.likes_list?.map((like, i) => (
            <React.Fragment key={like.user_id}>
              <Link to={`/profile/${like.user_id}`} className="font-bold hover:underline">
                {like.profile?.name || like.user_id}
              </Link>
              {i < (post.likes_list?.length ?? 0) - 1 ? ", " : ""}
            </React.Fragment>
          ))}
        </div>
      )}
      {/* Owner controls */}
      {user && post.user_id === user.id && editingPostId !== post.id && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(post.id, post.content)}
            className="px-2 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-2 py-1 rounded bg-red-400 hover:bg-red-500 text-white"
          >
            Delete
          </button>
        </div>
      )}
      {/* Comments Section */}
      {showComments && (
        <div className="mt-2 border-t pt-2">
          <ul>
            {commentsList?.map((comment) => (
              <li key={comment.id} className="mb-2">
                <div className="flex items-center">
                  {comment.profile?.profile_pic_url ? (
                    <img
                      src={comment.profile.profile_pic_url}
                      className="w-6 h-6 rounded-full mr-2"
                      alt={comment.profile.name || "comment user"}
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center"
                    >
                      <span role="img" aria-label="avatar" className="text-base">👤</span>
                    </div>
                  )}
                  <span className="font-semibold text-sm text-black">
                    {comment.profile?.name || "User"}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString("en-GB")}
                  </span>
                </div>
                <div className="ml-8 text-sm text-black">{comment.content}</div>
              </li>
            ))}
          </ul>
          <form
            className="flex gap-2 mt-2"
            onSubmit={e => handleAddComment(e, post.id)}
          >
            <input
              type="text"
              className="border rounded flex-1 p-1 text-black"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={e => handleCommentInput(post.id, e.target.value)}
              disabled={submittingComment}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              disabled={submittingComment}
            >
              {submittingComment ? "..." : "Post"}
            </button>
          </form>
        </div>
      )}
    </li>
  );
};

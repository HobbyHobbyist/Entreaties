from flask import Flask, request, session
from flask_cors import CORS
from flask_restful import Resource, Api
from flaskext.mysql import MySQL
from passlib.hash import pbkdf2_sha512

from uuid import uuid4
import base64
import os
import json


app = Flask(__name__)

app.static_folder = os.path.join(os.getcwd(), "stored_images")

cors = CORS(app, resources={r"/*": {"origins": "*"}})

api = Api(app)


app.config["MYSQL_DATABASE_USER"] = "ExposedUser"
app.config["MYSQL_DATABASE_PASSWORD"] = "ExposedPassword"
app.config["MYSQL_DATABASE_DB"] = "Entreaties_DB"
app.config["MYSQL_DATABASE_HOST"] = "localhost"
app.secret_key = "Not So Secret"

mysql = MySQL(app, autocommit=True)
db = mysql.connect()

def check_csrf_tokens(target_session, cookies): # Applied to all personal functions
    session_token = target_session.get("csrf_token")
    cookie_token = cookies.get("csrf_token")

    if session_token is not None and cookie_token is not None:
        if target_session["csrf_token"] == cookie_token:
            return True
        return False
    return False


class RegistrationHandler(Resource):
    def post(self):
        form = request.form
        email, password, profile_name = form.get("email"), form.get("password"), form.get("profile_name")
        if email is None or password is None or profile_name is None:
            return app.make_response({"error": "input supplied is insufficient"})
        uui = str(uuid4())
        profile_id = str(uui)
        salt = os.urandom(16).hex()
        password = password + salt
        password = pbkdf2_sha512.using(rounds=5000, salt_size=0).hash(password)

        cursor = db.cursor()
        cursor.execute("""INSERT INTO Profiles (Profile_ID, Email, Profile_Name, Password, Password_Salt) VALUES (%s, %s, %s, %s, %s)""",
                       (profile_id, email, profile_name, password, salt)) # triggers the creation of a profiling entry as well.
        cursor.close()
        response = app.make_response({"success": True})

        false_csrf_token = str(uuid4())
        session["csrf_token"] = false_csrf_token
        response.set_cookie("user", profile_id, secure=True, httponly=True, samesite="Strict")
        response.set_cookie("csrf_token", false_csrf_token, secure=True, httponly=True, samesite="Strict")
        
        return response


class LoginHandler(Resource):
    def post(self):
        form = request.form
        email, password = form.get("email"), form.get("password")
        cursor = db.cursor()
        cursor.execute("""SELECT Password_Salt FROM Profiles WHERE Email = %s LIMIT 1""", (email))
        
        password_salt = cursor.fetchone()[0]
        if len(password_salt) == None:
            return app.make_response({"result": "no matching logins"})
        password = password + password_salt
        password = pbkdf2_sha512.using(rounds=5000, salt_size=0).hash(password)
        cursor.execute("""SELECT Profile_ID FROM Profiles WHERE Email = %s AND Password = %s LIMIT 1 """, (email, password))
        output = cursor.fetchone()
        cursor.close()
        if output != None:
            response = app.make_response({"success": True})
            false_csrf_token = str(uuid4())
            session["csrf_token"] = false_csrf_token
            response.set_cookie("csrf_token", false_csrf_token, secure=True, httponly=True, samesite="Strict")
            response.set_cookie("user", output[0], secure=True, httponly=True, samesite="Strict")
            return response
        return app.make_response({"result": "no matching logins"})


class ImpersonalProfilingGetter(Resource):
    def get(self, target, profile_name):
        if target == "all":
            cursor = db.cursor()
            cursor.execute("""SELECT Profile_Name, 
            Care, Wit, Cool, Crudeness, Judgement, Malice, 
            Art, Design, Gaming, Programming, Music, Writing, Roleplaying, 
            Profile_Avatar, Biography

            FROM Profilings 
            WHERE Profile_Name = %s 
            LIMIT 1""", (profile_name,))
            output = cursor.fetchone()
            if len(output) < 1:
                return app.make_response({"error": "profile name doesn't exist"})
            
            profile_name, avatar, biography = output[0], output[14], output[15]
            care, wit, cool, crudeness, judgement, malice = output[1], output[2], output[3], output[4], output[5], output[6]
            art, design, gaming, programming, music, writing, roleplaying = output[7], output[8], output[9], output[10], \
                output[11], output[12], output[13]
            
            return app.make_response({"profile_name": profile_name, "avatar": avatar, "biography": biography,
                                        "interests": {"art": art, "design": design, "gaming": gaming, 
                                                      "programming": programming, "music": music, "writing": writing,
                                                      "roleplaying": roleplaying}, 
                                        "traits": {"care": care, "wit": wit, "cool": cool, "crudeness": crudeness,
                                                   "judgement": judgement, "malice": malice}})
    
        elif target == "biography":
            cursor = db.cursor()
            cursor.execute("""SELECT Biography FROM Profilings WHERE Profile_Name = %s """, (profile_name,))
            return app.make_response({"biography": cursor.fetchall()})

        elif target == "avatar":
            cursor = db.cursor()
            cursor.execute("""SELECT Profile_Avatar FROM Profilings WHERE Profile_Name = %s """, (profile_name,))
            avatar = cursor.fetchone()[0]
            cursor.close()
            return app.make_response({"avatar": avatar})



class PersonalProfilingGetter(Resource):
    def get(self, target):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})

        if target == "all":
            cursor = db.cursor()
            cursor.execute("""SELECT Profile_Name, 
            Care, Wit, Cool, Crudeness, Judgement, Malice, 
            Art, Design, Gaming, Programming, Music, Writing, Roleplaying, 
            Profile_Avatar, Biography

            FROM Profilings 
            WHERE Profile_ID = %s 
            LIMIT 1""", (user,))
            output = cursor.fetchone()
            if len(output) < 1:
                return app.make_response({"error": "user doesn't exist"})
            
            profile_name, avatar, biography = output[0], output[14], output[15]
            care, wit, cool, crudeness, judgement, malice = output[1], output[2], output[3], output[4], output[5], output[6]
            art, design, gaming, programming, music, writing, roleplaying = output[7], output[8], output[9], output[10], \
                output[11], output[12], output[13]
            
            return app.make_response({"profile_name": profile_name, "avatar": avatar, "biography": biography,
                                        "interests": {"art": art, "design": design, "gaming": gaming, 
                                                      "programming": programming, "music": music, "writing": writing,
                                                      "roleplaying": roleplaying}, 
                                        "traits": {"care": care, "wit": wit, "cool": cool, "crudeness": crudeness,
                                                   "judgement": judgement, "malice": malice}})
    
        elif target == "biography":
            cursor = db.cursor()
            cursor.execute("""SELECT Biography FROM Profilings WHERE Profile_ID = %s 
            LIMIT 1""", (user,))
            output = cursor.fetchall()
            cursor.close()
            return app.make_response({"biography": biography})

        elif target == "avatar":
            cursor.execute("""SELECT Avatar FROM Profilings WHERE Profile_ID = %s """, (user,))
            avatar = cursor.fetchall()
            cursor.close()
            return app.make_response({"avatar": cursor.fetchall()})
        
        elif target == "interests":
            cursor = db.cursor()
            cursor.execute("""SELECT Art, Design, Gaming, Programming, Music, Writing, Roleplaying 
            FROM Profilings WHERE Profile_ID = %s 
            LIMIT 1""", (user,))
            interests = cursor.fetchone()
            if len(interests) < 1:
                return app.make_response({"error": "user does not seem to exist"})
            art, design, gaming, programming, music, writing, roleplaying = interests
            cursor.close()
            return app.make_response({"art": art, "design": design, "gaming": gaming, "programming": programming,
                                      "music": music, "writing": writing, "roleplaying": roleplaying})
        


class PersonalProfilingSetter(Resource):
    def post(self, target):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})

        if target == "biography":
            biography = request.form.get("biography")
            if biography is None:
                return app.make_response({"error": "biography infomation was not sent"})
            cursor = db.cursor()
            cursor.execute("""UPDATE Profilings SET Biography = %s WHERE Profile_ID = %s
            LIMIT 1""", (biography, user,))
        
        elif target == "avatar":
            avatar_id = str(uuid4()) + ".png"
            with open("stored_images/avatars/" + avatar_id, "wb") as avatar_file:
                avatar_file.write(base64.decodebytes(request.files["avatar"].stream.read()))
            cursor = db.cursor()
            cursor.execute("""UPDATE Profilings SET Profile_Avatar = %s WHERE Profile_ID = %s LIMIT 1""", (avatar_id, user))
            cursor.close()
        
        elif target == "interests":
            form = request.form
            art, design, gaming, programming = form.get("art"), form.get("design"), form.get("gaming"), form.get("programming")
            music, writing, roleplaying = form.get("music"), form.get("writing"), form.get("roleplaying")
            cursor = db.cursor()
            cursor.execute("""UPDATE Profilings SET Art = %s, Design = %s, Gaming = %s, Programming = %s, Music = %s, 
            Writing = %s, Roleplaying = %s WHERE Profile_ID = %s
            LIMIT 1""", 
            (art, design, gaming, programming, music, writing, roleplaying, user))

        elif target == "introduction":
            introduction = request.form.get("introduction")
            if introduction != None:
                cursor = db.cursor()
                cursor.execute("UPDATE Profilings SET Introduction = %s WHERE Profile_ID = %s LIMIT 1", 
                               (introduction, user))
                cursor.close()



class ProfileSearchGetter(Resource):
    def get(self, target, search_string):
        cursor = db.cursor()
        if target == "all":
            cursor.execute(""" SELECT Profile_ID, Profile_Name, Profile_Avatar, Introduction 
            FROM Profilings WHERE Profile_Name LIKE CONCAT(%s, "%%") """, (search_string,))
            profilings = cursor.fetchall()
            return app.make_response({"profilings": profilings})
        
        elif target[0] == "&":
            interests = target.split("&")[1:]
            link_dict = {"art": 0, "design": 0, "gaming": 0, "programming": 0, "music": 0, "writing": 0,
                         "roleplaying": 0}
            for interest in interests:
                link_dict[interest] = 1
            
            # Because the interests are boolean, they'll never be 3. Returning 3 when a filtered interest is not 1 effectively means
            # its relevant condition is a nonfactor.
            cursor.execute(""" SELECT Profile_ID, Profile_Name, Profile_Avatar, Introduction 
            FROM Profilings WHERE Profile_Name LIKE CONCAT(%s, "%%") AND 
            ( Art = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END

            OR Design = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END
            
            OR Gaming = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END

            OR Programming = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END

            OR Music = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END

            OR Writing = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END

            OR Roleplaying = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3
            END 
            )

            LIMIT 20
            """, (search_string, link_dict["art"], link_dict["design"], link_dict["gaming"], link_dict["programming"],
                  link_dict["music"], link_dict["writing"], link_dict["roleplaying"]))
            
            profilings = cursor.fetchall()
            return app.make_response({"profilings": profilings})



class PersonalEntreatyGetter(Resource):
    def get(self):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        cursor.execute("""SELECT Entreaties.*, Pinned_Statuses.1 FROM Entreaties 
        LEFT JOIN (SELECT Entreaty_ID, Profile_ID FROM Entreaty_Members WHERE Entreaty_Members.Profile_ID = %s) AS Members 
        ON Members.Entreaty_ID = Entreaties.Entreaty_ID 

        LEFT JOIN (SELECT 1, Entreaty_ID FROM Pinned_Entreaties WHERE Profile_ID = %s) AS Pinned_Statuses
        ON Pinned_Statuses.Entreaty_ID = Entreaties.Entreaty_ID 

        WHERE Members.Profile_ID = %s 
        ORDER BY Pinned_Statuses.1 DESC, Entreaty_Date DESC""", (user, user, user))
        entreaties = cursor.fetchall()
        return app.make_response({"entreaties": entreaties})


class PersonalEntreatySetter(Resource):
    def post(self, objective):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        if objective == "create_entreaty":
            form = request.form
            entreaty_id = str(uuid4())
            entreaty_content = form.get("content")
            entreaty_title = form.get("title")
            entreaty_cover = None
            entreaty_cover_file = request.files.get("cover")
            if entreaty_cover_file is not None:
                entreaty_cover = str(uuid4()) + ".png"
                with open("stored_images/entreaty_covers/" + entreaty_cover, "wb") as cover_file:
                    cover_file.write(base64.decodebytes(entreaty_cover_file.stream.read()))

            art, design, gaming, programming, music, writing, roleplaying = form.get("art"), form.get("design"), form.get("gaming"), \
                form.get("programming"), form.get("music"), form.get("writing"), form.get("roleplaying")
            open_access = form.get("open_access")
            
            cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
            profile_name = cursor.fetchone()[0]

            cursor.execute("""INSERT INTO Entreaties (Profile_ID, Profile_Name, Entreaty_ID, Entreaty_Title, Entreaty_Content, 
            Entreaty_Cover, Art, Design, Gaming, Programming, Music, Writing, Roleplaying, Open_Access, Entreaty_Date) 
            VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW() )""",
            (user, profile_name, entreaty_id, entreaty_title, entreaty_content, entreaty_cover, art, design, gaming, programming,
            music, writing, roleplaying, open_access))
            cursor.close()
        
        elif objective == "pin_entreaties":
            cursor = db.cursor()
            pinnings = request.form.get("modified_pinnings")
            pinnings = json.loads(pinnings)
            to_add = []
            to_remove = []
            
            for entreaty_id, pin_status in pinnings:
                if pin_status == "true":
                    to_add.append((entreaty_id, user))
                elif pin_status == "false":
                    to_remove.append((entreaty_id, user))
            if len(to_add) > 0:
                if len(to_add) == 1:
                    cursor.execute("""INSERT INTO Pinned_Entreaties (Entreaty_ID, Profile_ID) VALUES (%s, %s) """, (to_add[0][0], 
                                                                                                                    to_add[0][1]))
                else:
                    cursor.executemany("""INSERT INTO Pinned_Entreaties (Entreaty_ID, Profile_ID) VALUES (%s, %s) """,
                                    to_add)
            if len(to_remove) > 0:
                if len(to_remove) == 1:
                    cursor.execute("""DELETE FROM Pinned_Entreaties WHERE Entreaty_ID = %s AND Profile_ID = %s LIMIT 1""",
                                        (to_remove[0][0], to_remove[0][1]))
                else:
                    cursor.executemany("""DELETE FROM Pinned_Entreaties WHERE Entreaty_ID = %s AND Profile_ID = %s LIMIT 1""",
                                        to_remove)
            



class ImpersonalEntreatyGetter(Resource):
    def get(self, target):
        cursor = db.cursor()
        
        if target == "all":
            cursor.execute("""SELECT Profile_Name, Entreaty_ID, Entreaty_Title, Entreaty_Content, Entreaty_Cover,
            Entreaty_Date FROM Entreaties LIMIT 20""")
            entreaties = cursor.fetchall()
            cursor.close()
            return app.make_response({"entreaties": entreaties})

        elif target[0] == "&":
            tags = target.split("&")[0:]
            link_dict = {"art": 0, "design": 0, "gaming": 0, "programming": 0, "music": 0, "writing": 0,
                         "roleplaying": 0}
            for tag in tags:
                link_dict[tag] = 1
            
            cursor.execute(""" SELECT Profile_Name, Entreaty_ID, Entreaty_Title, Entreaty_Content, Entreaty_Cover,
            Entreaty_Date FROM Entreaties 
            WHERE Art = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END

            OR Design = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END
            
            OR Gaming = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END

            OR Programming = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END

            OR Music = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END

            OR Writing = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END

            OR Roleplaying = CASE
                WHEN %s = 1
                THEN 1
                ELSE 3 
            END

            LIMIT 20
            """, (link_dict["art"], link_dict["design"], link_dict["gaming"],  link_dict["programming"], 
                   link_dict["music"],  link_dict["writing"],  link_dict["roleplaying"]))
            
            return app.make_response({"entreaties": cursor.fetchall()})



class ImpersonalEntreatyAdmissionGetter(Resource):
    def get(self, entreaty_id):
        cursor = db.cursor()
        cursor.execute("""SELECT Open_Access FROM Entreaties WHERE Entreaty_ID = %s LIMIT 1""", (entreaty_id,))
        open_access = cursor.fetchone()[0]
        return app.make_response({"open_access": open_access})



class PersonalEntreatyAdmissionGetter(Resource):
    def get(self, entreaty_id):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"member_status": "you're not even logged in bro"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        cursor = db.cursor()
        cursor.execute("SELECT Profile_ID FROM Entreaty_Members WHERE Profile_ID = %s AND Entreaty_ID = %s LIMIT 1", 
                       (user, entreaty_id))
        output = cursor.fetchall()
        cursor.close()
        if len(output) < 1:
            return app.make_response({"member_status": "not a member"})
            
        return app.make_response({"member_status": "is a member"})
    

class PersonalEntreatyAdmissionSetter(Resource):
    def post(self, entreaty_id):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        cursor = db.cursor()
        cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
        profile_name = cursor.fetchone()[0]

        cursor.execute("""INSERT INTO Entreaty_Members (Entreaty_ID, Profile_ID, Profile_Name) VALUES (%s, %s, %s)""", 
                       (entreaty_id, user, profile_name))
        cursor.close()
            
        return


class EntreatySectionsGetter(Resource):
    def get(self, entreaty_id):
        user = request.cookies.get("user")
        cursor = db.cursor()
        cursor.execute("""SELECT Open_Access FROM Entreaties WHERE Entreaty_ID = %s LIMIT 1""", (entreaty_id,))
        open_access = cursor.fetchone()[0]
        if open_access == 1:
            allowed = True

        if open_access != 1:
            if user == None:
                cursor.close()
                return app.make_response({"result": "the entreaty is not open access"})
            
            cursor.execute("SELECT Profile_ID FROM Entreaty_Members WHERE Profile_ID = %s AND Entreaty_ID = %s LIMIT 1", 
                       (user, entreaty_id))
            output = cursor.fetchall()
            cursor.close()
            if len(output) < 1:
                return app.make_response({"result": "the entreaty is not open access"})
            allowed = True

        if allowed is True:
            cursor.execute("""SELECT Section_ID, Section_Name, Parent_Entreaty FROM Entreaty_Sections 
            WHERE Parent_Entreaty = %s """, (entreaty_id))
            entreaty_sections = cursor.fetchall()
            return app.make_response({"entreaty_sections": entreaty_sections})
        return app.make_response({"result": "the entreaty is not open access"})


class EntreatySectionCreator(Resource):
    def post(self, entreaty_id):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        section_name = request.form.get("section_name")
        section_id = str(uuid4())
        cursor = db.cursor()
        cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
        profile_name = cursor.fetchone()[0]

        cursor.execute("""INSERT INTO Entreaty_Sections (Profile_ID, Profile_Name, Parent_Entreaty, Section_ID, 
        Section_Name, Section_Date) VALUES (%s, %s, %s, %s, %s, NOW())""", 
        (user, profile_name, entreaty_id, section_id, section_name))


class EntreatySectionThreadsGetter(Resource): 
    def get(self, entreaty_id, section_id):   
        cursor = db.cursor()                  
        cursor.execute("""SELECT Thread_ID, Thread_Title, Profile_Name, Thread_Date 
        FROM Entreaty_Threads 
        WHERE Parent_Entreaty = %s AND Parent_Section = %s """,
                       (entreaty_id, section_id))
        threads = cursor.fetchall()
        return app.make_response({"entreaty_threads": threads})


class EntreatySectionThreadCreator(Resource):
    def post(self, entreaty_id, section_id):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; missing user cookies"})
        form = request.form
        title, thread_content = form.get("title"), form.get("thread_content")
        thread_id = str(uuid4())
        cursor = db.cursor()
        cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
        profile_name = cursor.fetchone()[0]

        cursor.execute("""INSERT INTO Entreaty_Threads (Profile_ID, Profile_Name, Parent_Entreaty, Parent_Section, Thread_ID, 
        Thread_Title, Thread_Content, Thread_Date) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW()) """, 
        (user, profile_name, entreaty_id, section_id, thread_id, title, thread_content))
        

class PostGetter(Resource):
    def get(self, profile_name):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            cursor.execute("""SELECT Profile_Name, Post_ID, Post_Title, Post_Content, Amount_Of_Comments, Thumbs_Up_Reactions,
            Thumbs_Down_Reactions, Post_Date FROM POSTS 
            WHERE Profile_Name = %s 
            LIMIT 20 """, (profile_name,))
            posts = cursor.fetchall()
            cursor.close()
            return app.make_response({"posts": posts})
        
        cursor.execute("""SELECT Profile_Name, Posts.Post_ID, Post_Title, Post_Content, Amount_Of_Comments, Thumbs_Up_Reactions,
            Thumbs_Down_Reactions, Post_Date, GROUP_CONCAT(Given_Reactions.Reaction_Name) FROM Posts 
            LEFT JOIN (SELECT * FROM Post_Reactions WHERE Post_Reactions.Profile_ID = %s) AS Given_Reactions 
            ON Given_Reactions.Post_ID = Posts.Post_ID 
            WHERE Profile_Name = %s 
            GROUP BY Posts.Post_ID 
            LIMIT 20 """, (user, profile_name))
        posts = cursor.fetchall()
        cursor.close()
        return app.make_response({"posts": posts})


class PersonalPostGetter(Resource):
    def get(self, target):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        if target == "posts": 
            cursor.execute("""SELECT Profile_Name, Posts.Post_ID, Post_Title, Post_Content, Amount_Of_Comments, Thumbs_Up_Reactions,
                Thumbs_Down_Reactions, Post_Date, GROUP_CONCAT(Given_Reactions.Reaction_Name) FROM Posts 
                LEFT JOIN (SELECT * FROM Post_Reactions WHERE Post_Reactions.Profile_ID = %s) AS Given_Reactions 
                ON Given_Reactions.Post_ID = Posts.Post_ID
                WHERE Posts.Profile_ID = %s 
                GROUP BY Posts.Post_ID 
                LIMIT 20 """, (user, user,))
            
            return app.make_response({"posts": cursor.fetchall()})

        if target == "drafts":
            cursor.execute("""SELECT Draft_ID, Draft_Title FROM Drafts WHERE Profile_ID = %s """, (user,))
            drafts = cursor.fetchall()
            if len(drafts) > 0:
                return app.make_response({"draft_id_and_title_pairs": drafts})
            return app.make_response({"result": "no drafts"})
    
class PersonalPostSetter(Resource):
    def post(self, target):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        if target == "create_post":
            form = request.form
            post_id, post_title, post_content = str(uuid4()), form["draft_title"], form["draft_content"]
            if post_title == "Unnamed Draft":
                post_title = ""
            cursor = db.cursor()
            cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
            profile_name = cursor.fetchone()[0]

            cursor.execute("""INSERT INTO Posts (Profile_ID, Profile_Name, Post_ID, Post_Title, Post_Content, Post_DATE) 
            VALUES (%s, %s, %s, %s, %s, NOW())""", (user, profile_name, post_id, post_title, post_content))



class TargetedPostGetter(Resource):
    def get(self, profile_name, post_id):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            cursor.execute("""SELECT Profile_Name, Post_ID, Post_Title, Post_Content, Amount_Of_Comments, Thumbs_Up_Reactions,
            Thumbs_Down_Reactions, Post_Date FROM POSTS 
            WHERE Profile_Name = %s AND Post_ID = %s
            LIMIT 1 """, (profile_name, post_id))
            post = cursor.fetchall()[0]
            profile_name, post_id, post_title, post_content = post[0], post[1], post[2], post[3]
            amount_of_comments, thumbs_up, thumbs_down, post_date = post[4], post[5], post[6], post[7]
            print(post)
            return app.make_response({"post": 
            {"profile_name": profile_name, "post_id": post_id, "post_title": post_title, "post_content": post_content, 
             "amount_of_comments": amount_of_comments, "thumbs_up": thumbs_up, "thumbs_down": thumbs_down, 
             "post_date": post_date, "given_reactions": None}})
        
        cursor.execute("""SELECT Profile_Name, Posts.Post_ID, Post_Title, Post_Content, Amount_Of_Comments, Thumbs_Up_Reactions,
            Thumbs_Down_Reactions, Post_Date, GROUP_CONCAT(Given_Reactions.Reaction_Name) AS Reactions FROM Posts 
            LEFT JOIN (SELECT * FROM Post_Reactions WHERE Post_Reactions.Profile_ID = %s) AS Given_Reactions 
            ON Given_Reactions.Post_ID = Posts.Post_ID
            WHERE Profile_Name = %s AND Posts.Post_ID = %s 
            GROUP BY Post_ID
            LIMIT 1 """, (user, profile_name, post_id))
        post = cursor.fetchone()
        cursor.close()
        if len(post) > 0:
            profile_name, post_id, post_title, post_content = post[0], post[1], post[2], post[3]
            amount_of_comments, thumbs_up, thumbs_down, post_date = post[4], post[5], post[6], post[7]
            reactions = post[8]
            return app.make_response({"post": 
            {"profile_name": profile_name, "post_id": post_id, "post_title": post_title, "post_content": post_content, 
             "amount_of_comments": amount_of_comments, "thumbs_up": thumbs_up, "thumbs_down": thumbs_down, 
             "post_date": post_date, "given_reactions": reactions}})

        return app.make_response({"error": "no such post with the supplied user id and post id"})



class SubjectGetter(Resource):
    def get(self, post_id):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            cursor.execute("""SELECT Profile_Name, Subject_ID, Subject_Content, Amount_Of_Comments,
                Thumbs_Up_Reactions, Thumbs_Down_Reactions, Subject_Date FROM Post_Subjects 
                WHERE Parent_Post = %s """, (post_id,))
            subjects = cursor.fetchall()
            cursor.close()
            return app.make_response({"subjects": subjects})
        
        cursor.execute("""SELECT Profile_Name, Post_Subjects.Subject_ID, Subject_Content, Amount_Of_Comments, 
            Thumbs_Up_Reactions, Thumbs_Down_Reactions, Subject_Date, GROUP_CONCAT(Given_Reactions.Reaction_Name) AS Reactions 
            FROM Post_Subjects 
            LEFT JOIN (SELECT * FROM Post_Subject_Reactions WHERE Post_Subject_Reactions.Profile_ID = %s) AS Given_Reactions 
            ON Given_Reactions.Subject_ID = Post_Subjects.Subject_ID
            WHERE Parent_Post = %s 
            GROUP BY Subject_ID""", (user, post_id))
        subjects = cursor.fetchall()
        cursor.close()
        return app.make_response({"subjects": subjects})



class PersonalSubjectSetter(Resource):
    def post(self, target):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        if target == "create_subject":
            form = request.form
            subject_id, subject_content, parent_post = str(uuid4()), form["subject_content"], form["parent_post"]
            cursor = db.cursor()
            cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
            profile_name = cursor.fetchone()[0]

            cursor.execute("""INSERT INTO Post_Subjects (Profile_ID, Profile_Name, Parent_Post, Subject_ID, 
            Subject_Content, Subject_DATE) VALUES (%s, %s, %s, %s, %s, NOW())""", 
            (user, profile_name, parent_post, subject_id, subject_content))

            return app.make_response({"subject_id": subject_id})


class CommentGetter(Resource):
    def get(self, subject_id):
        cursor = db.cursor()
        user = request.cookies.get("user")
        if user is None:
            cursor.execute("""SELECT Profile_Name, Comment_ID, Comment_Content, Amount_Of_Comments,
                Thumbs_Up_Reactions, Thumbs_Down_Reactions, Comment_Date FROM Post_Comments 
                WHERE Parent_Subject = %s """, (subject_id,))
            comments = cursor.fetchall()
            cursor.close()
            return app.make_response({"comments": comments})
        
        cursor.execute("""SELECT Profile_Name, Post_Comments.Comment_ID, Comment_Content, Amount_Of_Comments, 
            Thumbs_Up_Reactions, Thumbs_Down_Reactions, Comment_Date, Profile_Avatar, 
            GROUP_CONCAT(Given_Reactions.Reaction_Name) AS Reactions 
            FROM Post_Comments 
            LEFT JOIN (SELECT * FROM Post_Comment_Reactions WHERE Post_Comment_Reactions.Profile_ID = %s) AS Given_Reactions 
            ON Given_Reactions.Comment_ID = Post_Comments.Comment_ID
            LEFT JOIN (SELECT Profile_Avatar, Profile_ID FROM Profilings ) AS Avatars
            ON Avatars.Profile_ID = Post_Comments.Profile_ID
            WHERE Parent_Subject = %s 
            GROUP BY Post_Comments.Comment_ID""", (user, subject_id))
        comments = cursor.fetchall()
        cursor.close()
        return app.make_response({"comments": comments})


class PersonalCommentSetter(Resource):
    def post(self, target):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        if target == "create_comment":
            form = request.form
            comment_id, comment_content = str(uuid4()), form["comment_content"]
            parent_post, parent_subject = form["parent_post"], form["parent_subject"]
            cursor = db.cursor()
            cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
            profile_name = cursor.fetchone()[0]

            cursor.execute("""INSERT INTO Post_Comments (Profile_ID, Profile_Name, Parent_Post, Parent_Subject, 
            Comment_ID, Comment_Content, Comment_DATE) VALUES (%s, %s, %s, %s, %s, %s, NOW())""", 
            (user, profile_name, parent_post, parent_subject, comment_id, comment_content))

            return app.make_response({"comment_id": comment_id})



class PersonalReactionHandler(Resource):
    def post(self, target):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        if target == "post":
            form = request.form
            post_id, reaction_name = form["id"], form["reaction"]
            cursor = db.cursor()
            cursor.callproc("seek_post_reaction", (user, post_id, reaction_name))
            target_reaction_count = cursor.fetchone()[0]
            if target_reaction_count < 1:
                cursor.callproc("create_post_reaction", (user, post_id, reaction_name))
                if reaction_name == "thumbs_up":
                    cursor.callproc("give_post_thumbs_up", (post_id,))
                elif reaction_name == "thumbs_down":
                    cursor.callproc("give_post_thumbs_down", (post_id,))
            else:
                cursor.callproc("remove_post_reaction", (user, post_id, reaction_name))
                if reaction_name == "thumbs_up":
                    cursor.callproc("remove_post_thumbs_up", (post_id,))
                elif reaction_name == "thumbs_down":
                    cursor.callproc("remove_post_thumbs_down", (post_id,))
        
        elif target == "subject":
            form = request.form
            subject_id, reaction_name = form["id"], form["reaction"]
            cursor = db.cursor()
            cursor.callproc("seek_post_subject_reaction", (user, subject_id, reaction_name))
            target_reaction_count = cursor.fetchone()[0]
            if target_reaction_count < 1:
                cursor.callproc("create_post_subject_reaction", (user, subject_id, reaction_name))
                if reaction_name == "thumbs_up":
                    cursor.callproc("give_post_subject_thumbs_up", (subject_id,))
                elif reaction_name == "thumbs_down":
                    cursor.callproc("give_post_subject_thumbs_down", (subject_id,))
            else:
                cursor.callproc("remove_post_subject_reaction", (user, subject_id, reaction_name))
                if reaction_name == "thumbs_up":
                    cursor.callproc("remove_post_subject_thumbs_up", (subject_id,))
                elif reaction_name == "thumbs_down":
                    cursor.callproc("remove_post_subject_thumbs_down", (subject_id,))
        
        elif target == "comment":
            form = request.form
            comment_id, reaction_name = form["id"], form["reaction"]
            cursor = db.cursor()
            cursor.callproc("seek_post_comment_reaction", (user, comment_id, reaction_name))
            target_reaction_count = cursor.fetchone()[0]
            if target_reaction_count < 1:
                cursor.callproc("create_post_comment_reaction", (user, comment_id, reaction_name))
                if reaction_name == "thumbs_up":
                    cursor.callproc("give_post_comment_thumbs_up", (comment_id,))
                elif reaction_name == "thumbs_down":
                    cursor.callproc("give_post_comment_thumbs_down", (comment_id,))
            else:
                cursor.callproc("remove_post_comment_reaction", (user, comment_id, reaction_name))
                if reaction_name == "thumbs_up":
                    cursor.callproc("remove_post_comment_thumbs_up", (comment_id,))
                elif reaction_name == "thumbs_down":
                    cursor.callproc("remove_post_comment_thumbs_down", (comment_id,))

        


class PersonalPersonalitySetter(Resource): # This is name is misleading; It's used for setting the personality of others, not oneself.
    def post(self, target_name):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        traits = request.form.get("traits")
        traits = json.loads(traits)
        link_dict = {"care": 0, "wit": 0, "cool": 0, "crudeness": 0, "judgement": 0, "malice": 0}
        for trait in traits.keys():
            trait_value = traits[trait]
            if trait_value == "true":
                link_dict[trait] = 1
            elif trait_value == "false":
                link_dict[trait] = -1

        cursor = db.cursor()
        cursor.execute("""SELECT Care, Wit, Cool, Crudeness, Judgement, Malice FROM Profiling_Ratings 
        WHERE Target_Profile_Name = %s AND Profile_ID = %s LIMIT 1 """,
                       (target_name, user))
        existing_rating = cursor.fetchone()
        if existing_rating != None:
            cursor.execute("""DELETE FROM Profiling_Ratings WHERE Target_Profile_Name = %s AND Profile_ID = %s """,
                           (target_name, user))
            # This also triggers a trigger statement that removes the rating's values from the target's profiling itself

        cursor.execute(""" UPDATE Profilings SET Care = Care + %s, Wit = Wit + %s, Cool = Cool + %s, 
        Crudeness = Crudeness + %s, Judgement = Judgement + %s, Malice = Malice + %s 
        WHERE Profile_Name = %s 
        LIMIT 1
        """, (link_dict["care"], link_dict["wit"], link_dict["cool"], link_dict["crudeness"], link_dict["judgement"],
              link_dict["malice"], target_name))
        
        cursor.execute("SELECT Profile_Name from Profiles WHERE Profile_ID = %s", (user,))
        profile_name = cursor.fetchone()[0]     

        cursor.execute("""INSERT INTO Profiling_Ratings (Care, Wit, Cool, Crudeness, Judgement, Malice,
        Target_Profile_Name, Profile_ID, Profile_Name) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) """, 
        (link_dict["care"], link_dict["wit"], link_dict["cool"], link_dict["crudeness"], link_dict["judgement"],
        link_dict["malice"], target_name, user, profile_name))

        cursor.close()


class PersonalPersonalityGetter(Resource): # Also misleading; It's used for getting the personality rating of others, not oneself.
    def get(self, target_name):
        user = request.cookies.get("user")
        if user is None:
            return app.make_response({"error": "not logged in; this route requires the user to be logged in"})
        if check_csrf_tokens(session, request.cookies) is False:
            return app.make_response({"error": "csrf token seems invalid"})
        
        cursor = db.cursor()
        cursor.execute("""SELECT Care, Wit, Cool, Crudeness, Judgement, Malice FROM Personality_Profilings 
        WHERE Profile_ID = %s AND Target_Profile_Name = %s LIMIT 1""", (user, target_name))
        personality_rating = cursor.fetchone()
        cursor.close()
        return app.make_response({"personality_rating": personality_rating})


class AvatarImageGetter(Resource):
    def get(self, target):
        return app.send_static_file("avatars/" + target)
    
    
class EntreatyCoverGetter(Resource):
    def get(self, target):
        return app.send_static_file("entreaty_covers/" + target)



api.add_resource(RegistrationHandler, "/register/")
api.add_resource(LoginHandler, "/login/")

api.add_resource(ImpersonalProfilingGetter, "/profiling/<target>/<profile_name>/")
api.add_resource(PersonalProfilingGetter, "/self/profiling/<target>/")
api.add_resource(PersonalProfilingSetter, "/self/update_profiling/<target>/")

api.add_resource(PersonalPersonalitySetter, "/self/rate_personality/<target_name>/")
api.add_resource(PersonalPersonalityGetter, "/self/get_rated_personality/<target_name>/")

api.add_resource(AvatarImageGetter, "/avatars/<target>/")


api.add_resource(ProfileSearchGetter, "/profile_search/<target>/<search_string>/")

api.add_resource(PersonalPostGetter, "/self/posts/<target>/")
api.add_resource(PostGetter, "/posts/<profile_name>/")
api.add_resource(PersonalPostSetter, "/self/post_management/<target>/")
api.add_resource(TargetedPostGetter, "/posts/<profile_name>/<post_id>/")

api.add_resource(SubjectGetter, "/subjects/<post_id>/")
api.add_resource(PersonalSubjectSetter, "/self/subjects/<target>/")

api.add_resource(CommentGetter, "/comments/<subject_id>/")
api.add_resource(PersonalCommentSetter, "/self/comments/<target>/")

api.add_resource(ImpersonalEntreatyGetter, "/entreaties/<target>/")
api.add_resource(PersonalEntreatyGetter, "/self/entreaties/")
api.add_resource(PersonalEntreatySetter, "/self/entreaty_management/<objective>/")

api.add_resource(EntreatyCoverGetter, "/entreaty_covers/<target>/")


api.add_resource(EntreatySectionsGetter, "/entreaty_sections/<entreaty_id>/")
api.add_resource(EntreatySectionCreator, "/create_entreaty_section/<entreaty_id>/")

api.add_resource(EntreatySectionThreadsGetter, "/entreaty_section_threads/<entreaty_id>/<section_id>/")
api.add_resource(EntreatySectionThreadCreator, "/create_entreaty_thread/<entreaty_id>/<section_id>/")

api.add_resource(ImpersonalEntreatyAdmissionGetter, "/entreaty_admission_info/<entreaty_id>/")
api.add_resource(PersonalEntreatyAdmissionGetter, "/self/entreaty_admission/<entreaty_id>/")
api.add_resource(PersonalEntreatyAdmissionSetter, "/self/entreaty_admission_post/<entreaty_id>/")

api.add_resource(PersonalReactionHandler, "/self/reactions/<target>/")

app.run(threaded=False)
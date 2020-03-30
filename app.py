from flask import Flask, request, jsonify, render_template
import pusher

pusher_client = pusher.Pusher(
  app_id='969273',
  key='699f7eb715ff1922a8f2',
  secret='a68ffed4e851644cdf2d',
  cluster='us2',
  ssl=True
)

app = Flask(__name__)

# A welcome message to test our server
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/wave', methods=["POST"])
def waveResponse():
	try:
	    pusher_client.trigger('my-channel', 'wave', {
	    	"fromID": request.form["fromID"], 
	    	"fromUsername": request.form["fromUsername"],  
	    	"toID": request.form["toID"], 
	    	"toUsername": request.form["toUsername"]
	    	})
	    return jsonify({"status": 200, "message": ""})
	except Exception as e:
		print(e)
		return jsonify({"status": 400, "message": "Failed to send wave."})

@app.route('/move', methods=["POST"])
def moveResponse():
	try:
	    pusher_client.trigger('my-channel', 'move', {
	    	"id": request.form["id"], 
	    	"x": request.form["x"],  
	    	"y": request.form["y"],
	    	"username": request.form["username"],
	    	"blank": request.form["blank"]
	    	})
	    return jsonify({"status": 200, "message": ""})
	except Exception as e:
		print(e)
		return jsonify({"status": 400, "message": ""})

@app.route('/exit', methods=["POST"])
def exit():
	try:
	    pusher_client.trigger('my-channel', 'leaving', {
	    	"id": request.form["id"]
	    	})
	    return jsonify({"status": 200, "message": ""})
	except Exception as e:
		print(e)
		return jsonify({"status": 400, "message": ""})

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000)
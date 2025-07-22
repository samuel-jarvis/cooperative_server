const mongoose = require('mongoose')

const accountSchema = mongoose.Schema(
  {
    savings: {
      type: Number,
      required: false,
      default: 0
    },
    checking: {
      type: Number,
      required: false,
      default: 0
    },
    number: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    countryCode: {
      type: String,
      required: false,
      trim: true
    },
    profilePicture: {
      public_id: {
        type: String,
        required: false
      },
      url: {
        type: String,
        required: false
      }
    },
    country: {
      type: String,
      required: false,
      trim: true
    },
    location: {
      address: {
        type: [String],
        required: false,
        default: [],
        index: true
      },
      state: {
        type: [String],
        required: false,
        default: [],
        index: true
      }
    },
    dateOfBirth: {
      type: Date,
      required: false
    },
    verificationStatus: {
      type: String,
      required: false,
      default: 'awaiting',
      enum: ['awaiting', 'pending', 'verified', 'failed']
    },
    otp: {
      type: String,
      required: false
    },
    isEmailConfirmed: {
      type: Boolean,
      required: false,
      default: false
    },
    verification: {
      document: {
        public_id: {
          type: String,
          required: false
        },
        url: {
          type: String,
          required: false
        }
      },
      proofOfAddress: {
        public_id: {
          type: String,
          required: false
        },
        url: {
          type: String,
          required: false
        }
      },
      documentType: {
        type: String,
        required: false
      }
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false
    },
    account: {
      type: accountSchema,
      required: false,
      default: {
        number: '',
        savings: 0,
        checkings: 0
      }
    },
    isBlocked: {
      type: Boolean,
      required: false,
      default: true
    },
    isAccountDisabled: {
      type: Boolean,
      required: false,
      default: false
    },
    paymentPin: {
      type: String,
      required: false
    },
    gender: {
      type: String,
      required: false
    },
    annualIncomeRange: {
      type: String,
      required: false
    },
    accountType: {
      type: String,
      required: false
    },
    ssnTIN: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
)

// module.exports = mongoose.model('User', UserSchema) || mongoose.models.User;
module.exports = mongoose.models.User || mongoose.model('User', UserSchema)
